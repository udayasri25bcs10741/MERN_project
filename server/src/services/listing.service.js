const FoodListing = require('../models/FoodListing');
const DonationRequest = require('../models/DonationRequest');

const buildListingLocation = (lng, lat) => {
  if (lng !== undefined && lat !== undefined) {
    return { type: 'Point', coordinates: [Number(lng), Number(lat)] };
  }
  return undefined;
};

const createListing = async (donorId, donorType, data, imageUrl, imagePublicId) => {
  const listingData = {
    donor: donorId,
    donorType,
    title: data.title,
    description: data.description,
    category: data.category,
    imageUrl: imageUrl || null,
    imagePublicId: imagePublicId || null,
    quantity: data.quantity,
    unit: data.unit,
    availableFrom: data.availableFrom,
    collectionDeadline: data.collectionDeadline,
    storageCondition: data.storageCondition,
    allergenInformation: data.allergenInformation,
    allergenStatus: data.allergenStatus || 'unknown',
    pickupAddress: data.pickupAddress,
    status: 'available',
  };

  const location = buildListingLocation(data.locationLng, data.locationLat);
  if (location) listingData.location = location;

  const listing = await FoodListing.create(listingData);
  return listing;
};

// Escape special regex characters to prevent ReDoS via user-supplied search strings.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getListings = async ({ category, status, page = 1, limit = 12, sortBy, search } = {}) => {
  const query = {};
  const now = new Date();

  if (category) query.category = category;
  if (status) {
    query.status = status;
  } else {
    // By default, only show available listings publicly (admin sees all via different endpoint)
    query.status = 'available';
    // Also exclude those past deadline
    query.collectionDeadline = { $gt: now };
  }

  if (search) {
    // Limit search length and escape special characters to prevent ReDoS
    const safeSearch = escapeRegex(String(search).slice(0, 100));
    query.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const sort = sortBy === 'deadline' ? { collectionDeadline: 1 } : { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    FoodListing.find(query)
      .populate('donor', 'name organizationName role')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    FoodListing.countDocuments(query),
  ]);

  return {
    listings,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

const getListingById = async (id, user) => {
  const listing = await FoodListing.findById(id)
    .populate('donor', 'name organizationName role phone address')
    .lean();

  if (!listing) {
    const err = new Error('Listing not found.');
    err.statusCode = 404;
    throw err;
  }

  // Privacy check: exact pickup address and donor contact are only revealed to:
  // 1. Platform Admin
  // 2. The owner donor of this listing
  // 3. The verified NGO with an accepted or completed request
  // 4. The assigned volunteer for this pickup
  let canViewPrivateDetails = false;
  if (user) {
    if (user.role === 'admin') {
      canViewPrivateDetails = true;
    } else if (listing.donor?._id && listing.donor._id.toString() === user._id.toString()) {
      canViewPrivateDetails = true;
    } else if (user.role === 'ngo') {
      const acceptedRequest = await DonationRequest.findOne({
        listing: id,
        recipient: user._id,
        status: { $in: ['accepted', 'completed'] },
      });
      if (acceptedRequest) canViewPrivateDetails = true;
    } else if (user.role === 'volunteer') {
      const assignedRequest = await DonationRequest.findOne({
        listing: id,
        assignedVolunteer: user._id,
        status: { $in: ['accepted', 'completed'] },
      });
      if (assignedRequest) canViewPrivateDetails = true;
    }
  }

  if (!canViewPrivateDetails) {
    listing.pickupAddress = 'Exact address provided upon confirmed pickup reservation';
    if (listing.donor) {
      delete listing.donor.phone;
      delete listing.donor.address;
    }
  }

  return listing;
};

const updateListing = async (listingId, donorId, updates) => {
  const listing = await FoodListing.findById(listingId);
  if (!listing) {
    const err = new Error('Listing not found.');
    err.statusCode = 404;
    throw err;
  }

  if (listing.donor.toString() !== donorId.toString()) {
    const err = new Error('You are not authorized to edit this listing.');
    err.statusCode = 403;
    throw err;
  }

  if (!['available'].includes(listing.status)) {
    const err = new Error('Only available listings can be edited.');
    err.statusCode = 409;
    throw err;
  }

  if (updates.collectionDeadline && new Date(updates.collectionDeadline) <= new Date()) {
    const err = new Error('Collection deadline must be in the future.');
    err.statusCode = 400;
    throw err;
  }

  const allowedFields = [
    'title', 'description', 'category', 'quantity', 'unit',
    'availableFrom', 'collectionDeadline', 'storageCondition',
    'allergenInformation', 'allergenStatus', 'pickupAddress',
  ];

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) listing[field] = updates[field];
  });

  const location = buildListingLocation(updates.locationLng, updates.locationLat);
  if (location) listing.location = location;

  await listing.save();
  return listing;
};

const withdrawListing = async (listingId, donorId, reason) => {
  const listing = await FoodListing.findById(listingId);
  if (!listing) {
    const err = new Error('Listing not found.');
    err.statusCode = 404;
    throw err;
  }

  if (listing.donor.toString() !== donorId.toString()) {
    const err = new Error('You are not authorized to withdraw this listing.');
    err.statusCode = 403;
    throw err;
  }

  if (!['available'].includes(listing.status)) {
    const err = new Error('Only available listings can be withdrawn.');
    err.statusCode = 409;
    throw err;
  }

  // Cancel any pending requests
  await DonationRequest.updateMany(
    { listing: listingId, status: 'pending' },
    { status: 'cancelled', cancellationReason: 'Listing withdrawn by donor' }
  );

  listing.status = 'withdrawn';
  listing.withdrawnAt = new Date();
  listing.withdrawalReason = reason;
  await listing.save();

  return listing;
};

const getMyListings = async (donorId, { page = 1, limit = 10, status } = {}) => {
  const query = { donor: donorId };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    FoodListing.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    FoodListing.countDocuments(query),
  ]);

  return {
    listings,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

// Mark expired listings - call periodically or before queries
const markExpiredListings = async () => {
  const result = await FoodListing.updateMany(
    {
      status: 'available',
      collectionDeadline: { $lt: new Date() },
    },
    { status: 'expired' }
  );
  return result.modifiedCount;
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  withdrawListing,
  getMyListings,
  markExpiredListings,
};
