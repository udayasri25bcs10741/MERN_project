const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const DonationRequest = require('../models/DonationRequest');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const notificationService = require('./notification.service');

const MAX_CODE_ATTEMPTS = 5;

const generatePickupCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8-char hex code
};

const hashCode = async (code) => {
  return bcrypt.hash(code, 10);
};

/**
 * Create a donation request (NGO only, verified).
 * Prevents duplicate active requests atomically.
 */
const createRequest = async (listingId, recipientId, { requestedQuantity, message }) => {
  const listing = await FoodListing.findById(listingId);
  if (!listing) {
    const err = new Error('Listing not found.');
    err.statusCode = 404;
    throw err;
  }

  if (listing.donor.toString() === recipientId.toString()) {
    const err = new Error('You cannot request your own donation.');
    err.statusCode = 403;
    throw err;
  }

  // Validate quantity
  if (!requestedQuantity || requestedQuantity <= 0) {
    const err = new Error('Requested quantity must be greater than 0.');
    err.statusCode = 400;
    throw err;
  }

  if (requestedQuantity > listing.quantity) {
    const err = new Error(
      `Requested quantity (${requestedQuantity} ${listing.unit}) cannot exceed available quantity (${listing.quantity} ${listing.unit}).`
    );
    err.statusCode = 400;
    throw err;
  }

  // Check listing is available and not expired
  if (listing.status !== 'available') {
    const err = new Error(`This listing is no longer available (status: ${listing.status}).`);
    err.statusCode = 409;
    throw err;
  }

  if (listing.collectionDeadline < new Date()) {
    const err = new Error('This listing has expired and cannot be claimed.');
    err.statusCode = 409;
    throw err;
  }

  // Check for duplicate active request (also enforced by DB index)
  const existing = await DonationRequest.findOne({
    listing: listingId,
    recipient: recipientId,
    status: { $in: ['pending', 'accepted'] },
  });
  if (existing) {
    const err = new Error('You already have an active request for this listing.');
    err.statusCode = 409;
    throw err;
  }

  const request = await DonationRequest.create({
    listing: listingId,
    recipient: recipientId,
    requestedQuantity,
    unit: listing.unit,
    message,
    status: 'pending',
  });

  // Notify donor
  await notificationService.create({
    recipientId: listing.donor,
    type: 'new_request',
    message: `You have a new donation request for "${listing.title}".`,
    listingId,
    requestId: request._id,
  });

  return request.populate('listing recipient');
};

/**
 * Donor accepts or rejects a request.
 * Acceptance atomically sets listing to reserved.
 * On acceptance, competing pending requests are rejected.
 */
const decideRequest = async (requestId, donorId, { decision, scheduledPickupAt }) => {
  const isAccepted = decision === 'accepted' || decision === 'accept';
  let session = null;
  let useTransaction = true;

  try {
    session = await mongoose.startSession();
  } catch {
    useTransaction = false;
  }

  const executeDecision = async (sess) => {
    const sOpt = sess ? { session: sess } : {};
    const request = await DonationRequest.findById(requestId).setOptions(sOpt);
    if (!request) {
      const err = new Error('Request not found.');
      err.statusCode = 404;
      throw err;
    }

    if (request.status !== 'pending') {
      const err = new Error(`Request cannot be decided. Current status: ${request.status}`);
      err.statusCode = 409;
      throw err;
    }

    const listing = await FoodListing.findById(request.listing).setOptions(sOpt);
    if (!listing) {
      const err = new Error('Associated listing not found.');
      err.statusCode = 404;
      throw err;
    }

    if (listing.donor.toString() !== donorId.toString()) {
      const err = new Error('You are not authorized to decide on this request.');
      err.statusCode = 403;
      throw err;
    }

    if (listing.status !== 'available') {
      const err = new Error('Listing is no longer available.');
      err.statusCode = 409;
      throw err;
    }

    if (listing.collectionDeadline && listing.collectionDeadline < new Date()) {
      const err = new Error('Listing has expired.');
      err.statusCode = 409;
      throw err;
    }

    if (isAccepted) {
      // Atomically reserve listing
      const updated = await FoodListing.findOneAndUpdate(
        { _id: listing._id, status: 'available' },
        { status: 'reserved' },
        { new: true, ...sOpt }
      );

      if (!updated) {
        const err = new Error('Listing was already reserved by another request. Please refresh and try again.');
        err.statusCode = 409;
        throw err;
      }

      // Generate pickup code
      const plainCode = generatePickupCode();
      const codeHash = await hashCode(plainCode);
      const codeExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      request.status = 'accepted';
      request.decisionAt = new Date();
      request.decidedBy = donorId;
      request.pickupStatus = 'awaiting_pickup';
      request.pickupCodeHash = codeHash;
      request.pickupCodeExpiresAt = codeExpiry;
      if (scheduledPickupAt) request.scheduledPickupAt = scheduledPickupAt;
      await request.save(sOpt);

      // Find competing pending requests to notify them
      const competing = await DonationRequest.find(
        { listing: listing._id, _id: { $ne: requestId }, status: 'pending' },
        '_id recipient',
        sOpt
      ).lean();

      // Reject all other pending requests for this listing
      await DonationRequest.updateMany(
        { listing: listing._id, _id: { $ne: requestId }, status: 'pending' },
        { status: 'rejected', decisionAt: new Date(), decidedBy: donorId },
        sOpt
      );

      return { request, pickupCode: plainCode, competing };
    } else {
      // rejected
      request.status = 'rejected';
      request.decisionAt = new Date();
      request.decidedBy = donorId;
      await request.save(sOpt);
      return { request, pickupCode: null, competing: [] };
    }
  };

  let result;
  if (useTransaction && session) {
    try {
      await session.withTransaction(async () => {
        result = await executeDecision(session);
      });
    } catch (txErr) {
      if (
        txErr.message?.includes('replica set') ||
        txErr.message?.includes('Transaction numbers') ||
        txErr.message?.includes('transactions are not supported')
      ) {
        result = await executeDecision(null);
      } else {
        throw txErr;
      }
    } finally {
      await session.endSession();
    }
  } else {
    result = await executeDecision(null);
  }

  // Notifications outside transaction
  const populatedRequest = await DonationRequest.findById(result.request._id)
    .populate('listing', 'title')
    .populate('recipient', 'name');

  const notifType = isAccepted ? 'request_accepted' : 'request_rejected';
  const notifMsg = isAccepted
    ? `Your request for "${populatedRequest?.listing?.title || 'Food'}" has been accepted!`
    : `Your request for "${populatedRequest?.listing?.title || 'Food'}" was not accepted.`;

  await notificationService.create({
    recipientId: result.request.recipient,
    type: notifType,
    message: notifMsg,
    listingId: result.request.listing,
    requestId: result.request._id,
  });

  // Notify any competing NGOs that the donation was claimed
  if (result.competing && result.competing.length > 0) {
    for (const comp of result.competing) {
      await notificationService.create({
        recipientId: comp.recipient,
        type: 'request_rejected',
        message: `The donation "${populatedRequest?.listing?.title || 'Food'}" was accepted for another organization.`,
        listingId: result.request.listing,
        requestId: comp._id,
      }).catch(() => {});
    }
  }

  return result;
};

/**
 * NGO cancels a pending or accepted request.
 */
const cancelRequest = async (requestId, recipientId, reason) => {
  const request = await DonationRequest.findById(requestId);
  if (!request) {
    const err = new Error('Request not found.');
    err.statusCode = 404;
    throw err;
  }

  if (request.recipient.toString() !== recipientId.toString()) {
    const err = new Error('You are not authorized to cancel this request.');
    err.statusCode = 403;
    throw err;
  }

  if (!['pending', 'accepted'].includes(request.status)) {
    const err = new Error('Only pending or accepted requests can be cancelled.');
    err.statusCode = 409;
    throw err;
  }

  const wasAccepted = request.status === 'accepted';
  request.status = 'cancelled';
  request.cancellationReason = reason;
  await request.save();

  // Restore listing availability only if it was reserved and deadline hasn't passed
  if (wasAccepted) {
    const listing = await FoodListing.findById(request.listing);
    if (listing && listing.collectionDeadline > new Date() && listing.status === 'reserved') {
      listing.status = 'available';
      await listing.save();
    }
  }

  return request;
};

/**
 * Assign a volunteer to an accepted request.
 */
const assignVolunteer = async (requestId, ngoId, { volunteerId, scheduledPickupAt }) => {
  const volunteer = await User.findById(volunteerId);
  if (!volunteer || volunteer.role !== 'volunteer') {
    const err = new Error('Volunteer not found or user is not a volunteer.');
    err.statusCode = 404;
    throw err;
  }

  if (volunteer.verificationStatus !== 'approved') {
    const err = new Error('Volunteer must be approved before being assigned.');
    err.statusCode = 403;
    throw err;
  }

  const request = await DonationRequest.findById(requestId);
  if (!request) {
    const err = new Error('Request not found.');
    err.statusCode = 404;
    throw err;
  }

  if (request.recipient.toString() !== ngoId.toString()) {
    const err = new Error('You are not authorized to assign volunteers to this request.');
    err.statusCode = 403;
    throw err;
  }

  if (request.status !== 'accepted') {
    const err = new Error('Volunteer can only be assigned to accepted requests.');
    err.statusCode = 409;
    throw err;
  }

  request.assignedVolunteer = volunteerId;
  if (scheduledPickupAt) request.scheduledPickupAt = scheduledPickupAt;
  await request.save();

  // Notify volunteer
  await notificationService.create({
    recipientId: volunteerId,
    type: 'volunteer_assigned',
    message: 'You have been assigned a pickup. Please check your volunteer dashboard.',
    listingId: request.listing,
    requestId: request._id,
  });

  return request;
};

/**
 * Confirm pickup using code.
 * Rate-limited: max 5 failed attempts.
 */
const confirmPickup = async (requestId, actorId, pickupCode) => {
  const request = await DonationRequest.findById(requestId)
    .select('+pickupCodeHash +pickupCodeExpiresAt +pickupCodeAttempts');

  if (!request) {
    const err = new Error('Request not found.');
    err.statusCode = 404;
    throw err;
  }

  // Actor must be the recipient NGO or the assigned volunteer
  const isAuthorized =
    request.recipient.toString() === actorId.toString() ||
    (request.assignedVolunteer && request.assignedVolunteer.toString() === actorId.toString());

  if (!isAuthorized) {
    const err = new Error('You are not authorized to confirm this pickup.');
    err.statusCode = 403;
    throw err;
  }

  if (request.status !== 'accepted') {
    const err = new Error('Pickup can only be confirmed for accepted requests.');
    err.statusCode = 409;
    throw err;
  }

  if (!request.pickupCodeHash) {
    const err = new Error('No pickup code has been generated for this request.');
    err.statusCode = 400;
    throw err;
  }

  // Rate limit code attempts
  if (request.pickupCodeAttempts >= MAX_CODE_ATTEMPTS) {
    const err = new Error('Too many failed verification attempts. Please contact support.');
    err.statusCode = 429;
    throw err;
  }

  if (request.pickupCodeExpiresAt && request.pickupCodeExpiresAt < new Date()) {
    const err = new Error('Pickup verification code has expired.');
    err.statusCode = 400;
    throw err;
  }

  const isCodeValid = await bcrypt.compare(pickupCode.trim().toUpperCase(), request.pickupCodeHash);

  if (!isCodeValid) {
    request.pickupCodeAttempts += 1;
    await request.save();
    const err = new Error(`Invalid pickup code. ${MAX_CODE_ATTEMPTS - request.pickupCodeAttempts} attempts remaining.`);
    err.statusCode = 400;
    throw err;
  }

  // Complete the pickup
  request.status = 'completed';
  request.pickupStatus = 'collected';
  request.completedAt = new Date();
  request.confirmationActor = actorId;
  request.pickupCodeHash = undefined;
  request.pickupCodeAttempts = 0;
  await request.save();

  // Mark listing as collected
  await FoodListing.findByIdAndUpdate(request.listing, { status: 'collected' });

  // Notify donor
  const listing = await FoodListing.findById(request.listing);
  await notificationService.create({
    recipientId: listing?.donor,
    type: 'pickup_completed',
    message: `Your donation "${listing?.title}" has been successfully collected!`,
    listingId: request.listing,
    requestId: request._id,
  });

  return request;
};

/**
 * Manual confirmation (requires BOTH donor AND recipient/volunteer to confirm).
 * First call: records the actor's confirmation and returns status.
 * Second call (by the other party): completes the pickup.
 * Admin can always force-complete (bypasses dual requirement).
 */
const confirmPickupManual = async (requestId, actorId, isAdmin = false) => {
  const request = await DonationRequest.findById(requestId).populate('listing');
  if (!request) {
    const err = new Error('Request not found.');
    err.statusCode = 404;
    throw err;
  }

  const listing = request.listing;
  const isDonor = listing.donor.toString() === actorId.toString();
  const isRecipient = request.recipient.toString() === actorId.toString();
  const isVolunteer = request.assignedVolunteer && request.assignedVolunteer.toString() === actorId.toString();

  if (!isDonor && !isRecipient && !isVolunteer && !isAdmin) {
    const err = new Error('You are not authorized to confirm this pickup.');
    err.statusCode = 403;
    throw err;
  }

  if (request.status !== 'accepted') {
    const err = new Error('Only accepted requests can be manually confirmed.');
    err.statusCode = 409;
    throw err;
  }

  // Admin bypass: immediately complete
  if (isAdmin) {
    request.status = 'completed';
    request.pickupStatus = 'collected';
    request.completedAt = new Date();
    request.donorConfirmed = true;
    request.recipientConfirmed = true;
    request.confirmationActor = actorId;
    await request.save();
    await FoodListing.findByIdAndUpdate(request.listing._id, { status: 'collected' });
    return { request, completed: true };
  }

  // Record donor confirmation
  if (isDonor && !request.donorConfirmed) {
    request.donorConfirmed = true;
    request.donorConfirmedAt = new Date();
  }

  // Record recipient/volunteer confirmation
  if ((isRecipient || isVolunteer) && !request.recipientConfirmed) {
    request.recipientConfirmed = true;
    request.recipientConfirmedAt = new Date();
    request.confirmationActor = actorId;
  }

  // Complete only when both parties have confirmed
  if (request.donorConfirmed && request.recipientConfirmed) {
    request.status = 'completed';
    request.pickupStatus = 'collected';
    request.completedAt = new Date();
    await request.save();
    await FoodListing.findByIdAndUpdate(request.listing._id, { status: 'collected' });

    // Notify donor that donation was collected
    await notificationService.create({
      recipientId: listing.donor,
      type: 'pickup_completed',
      message: `Your donation "${listing.title}" has been manually confirmed as collected.`,
      listingId: request.listing._id,
      requestId: request._id,
    });

    return { request, completed: true };
  }

  await request.save();
  const waitingFor = !request.donorConfirmed ? 'donor' : 'recipient or volunteer';
  return { request, completed: false, waitingFor };
};

/**
 * Dispute a pickup.
 */
const disputePickup = async (requestId, actorId, { reason, details }) => {
  const request = await DonationRequest.findById(requestId).populate('listing');
  if (!request) {
    const err = new Error('Request not found.');
    err.statusCode = 404;
    throw err;
  }

  const listing = request.listing;
  const isAuthorized =
    listing.donor.toString() === actorId.toString() ||
    request.recipient.toString() === actorId.toString() ||
    (request.assignedVolunteer && request.assignedVolunteer.toString() === actorId.toString());

  if (!isAuthorized) {
    const err = new Error('You are not authorized to dispute this pickup.');
    err.statusCode = 403;
    throw err;
  }

  if (!['accepted', 'completed'].includes(request.status)) {
    const err = new Error('Only accepted or completed requests can be disputed.');
    err.statusCode = 409;
    throw err;
  }

  request.status = 'disputed';
  request.pickupStatus = 'disputed';
  request.disputeReason = `${reason}: ${details || ''}`;
  await request.save();

  return request;
};

const getMyRequests = async (userId, { page = 1, limit = 10, status } = {}) => {
  const query = { recipient: userId };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    DonationRequest.find(query)
      .populate('listing', 'title category imageUrl unit quantity status collectionDeadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    DonationRequest.countDocuments(query),
  ]);

  return {
    requests,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const getIncomingRequests = async (donorId, { page = 1, limit = 10, status } = {}) => {
  // Get listings by this donor
  const donorListings = await FoodListing.find({ donor: donorId }).select('_id').lean();
  const listingIds = donorListings.map((l) => l._id);

  const query = { listing: { $in: listingIds } };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [requests, total] = await Promise.all([
    DonationRequest.find(query)
      .populate('listing', 'title category imageUrl unit quantity status collectionDeadline')
      .populate('recipient', 'name organizationName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    DonationRequest.countDocuments(query),
  ]);

  return {
    requests,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const getAssignedPickups = async (volunteerId, { page = 1, limit = 10 } = {}) => {
  const query = { assignedVolunteer: volunteerId };
  const skip = (Number(page) - 1) * Number(limit);

  const [requests, total] = await Promise.all([
    DonationRequest.find(query)
      .populate('listing', 'title category pickupAddress unit quantity collectionDeadline')
      .populate('recipient', 'name organizationName')
      .sort({ scheduledPickupAt: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    DonationRequest.countDocuments(query),
  ]);

  return {
    requests,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const getRequestById = async (requestId, userId) => {
  const request = await DonationRequest.findById(requestId)
    .populate('listing')
    .populate('recipient', 'name organizationName role phone')
    .populate('assignedVolunteer', 'name phone')
    .populate('decidedBy', 'name')
    .populate('confirmationActor', 'name');

  if (!request) {
    const err = new Error('Request not found.');
    err.statusCode = 404;
    throw err;
  }

  const listing = request.listing;
  const isAuthorized =
    listing.donor.toString() === userId.toString() ||
    request.recipient._id.toString() === userId.toString() ||
    (request.assignedVolunteer && request.assignedVolunteer._id.toString() === userId.toString());

  if (!isAuthorized) {
    const err = new Error('You are not authorized to view this request.');
    err.statusCode = 403;
    throw err;
  }

  return request;
};

module.exports = {
  createRequest,
  decideRequest,
  cancelRequest,
  assignVolunteer,
  confirmPickup,
  confirmPickupManual,
  disputePickup,
  getMyRequests,
  getIncomingRequests,
  getAssignedPickups,
  getRequestById,
};
