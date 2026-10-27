const Notification = require('../models/Notification');

const create = async ({ recipientId, type, message, listingId, requestId }) => {
  if (!recipientId) return null;
  try {
    return await Notification.create({
      recipient: recipientId,
      type,
      message,
      relatedListing: listingId || null,
      relatedRequest: requestId || null,
    });
  } catch {
    // Notifications are non-critical; log but don't fail
    console.error('Failed to create notification:', { recipientId, type, message });
    return null;
  }
};

const getForUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('relatedListing', 'title')
      .lean(),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  };
};

const markRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    const err = new Error('Notification not found.');
    err.statusCode = 404;
    throw err;
  }
  return notification;
};

const markAllRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, read: false }, { read: true });
};

module.exports = { create, getForUser, markRead, markAllRead };
