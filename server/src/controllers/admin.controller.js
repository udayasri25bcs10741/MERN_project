const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const AuditLog = require('../models/AuditLog');
const notificationService = require('../services/notification.service');

const getVerifications = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;
    const query = { role: { $in: ['ngo', 'volunteer'] } };
    if (status) query.verificationStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -verificationNotes')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
};

const decideVerification = async (req, res, next) => {
  try {
    const decision = req.body.decision || req.body.status;
    const { notes } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be approved or rejected.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (!['ngo', 'volunteer'].includes(user.role)) {
      return res.status(400).json({ success: false, message: 'Only NGO or volunteer accounts can be verified.' });
    }

    user.verificationStatus = decision;
    if (notes) user.verificationNotes = notes;
    await user.save();

    // Audit log
    await AuditLog.create({
      actor: req.user._id,
      action: `verification_${decision}`,
      targetType: 'User',
      targetId: user._id,
      reason: notes,
    });

    // Notify user
    await notificationService.create({
      recipientId: user._id,
      type: decision === 'approved' ? 'verification_approved' : 'verification_rejected',
      message:
        decision === 'approved'
          ? 'Your verification has been approved! You can now access all features.'
          : `Your verification was not approved. ${notes || ''}`,
    });

    res.status(200).json({ success: true, message: `Verification ${decision}.`, data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
};

const getAllListings = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      FoodListing.find(query)
        .populate('donor', 'name organizationName role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      FoodListing.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        listings,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
};

const moderateListing = async (req, res, next) => {
  try {
    let { action, reason } = req.body;
    if (action === 'hide') action = 'unavailable';
    if (action === 'unhide') action = 'available';

    if (!['unavailable', 'available'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be unavailable/hide or available/unhide.' });
    }

    const listing = await FoodListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

    listing.status = action;
    listing.moderatedAt = new Date();
    listing.moderationReason = reason;
    await listing.save();

    await AuditLog.create({
      actor: req.user._id,
      action: `listing_moderated_${action}`,
      targetType: 'FoodListing',
      targetId: listing._id,
      reason,
    });

    res.status(200).json({ success: true, message: `Listing ${action}.`, data: { listing } });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status) query.accountStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -verificationNotes -verificationDocumentUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.params.id;
    const { status, reason } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.accountStatus = status === 'active' ? 'active' : 'suspended';
    if (reason) user.suspensionReason = reason;
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      action: `user_${user.accountStatus}`,
      targetType: 'User',
      targetId: user._id,
      reason,
    });

    res.status(200).json({ success: true, message: `User ${user.accountStatus}.`, data: { user: user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
};

const suspendUser = updateUserStatus;
const reactivateUser = updateUserStatus;

const getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      AuditLog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs: logs.map(l => ({
          ...l,
          user: l.actor,
          entityType: l.targetType,
          entityId: l.targetId,
          details: l.reason,
        })),
        pagination: { total, page: Number(page), limit: Number(limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVerifications,
  decideVerification,
  getAllListings,
  moderateListing,
  getAllUsers,
  updateUserStatus,
  suspendUser,
  reactivateUser,
  getAuditLogs,
};
