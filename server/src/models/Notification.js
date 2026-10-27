const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'new_request',
  'request_accepted',
  'request_rejected',
  'volunteer_assigned',
  'pickup_reminder',
  'pickup_completed',
  'pickup_disputed',
  'verification_approved',
  'verification_rejected',
  'listing_moderated',
  'account_suspended',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedListing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing',
      default: null,
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
