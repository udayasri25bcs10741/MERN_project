const mongoose = require('mongoose');

const REQUEST_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled', 'completed', 'disputed'];
// Authoritative pickup status values written by the service layer:
// awaiting_pickup -> pickup confirmed/accepted, waiting for volunteer
// pickup_in_progress -> volunteer en-route (future use)
// collected -> pickup successfully completed
// disputed -> pickup contested
const PICKUP_STATUSES = [
  'awaiting_pickup',
  'pickup_in_progress',
  'collected',
  'disputed',
];

const donationRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: [0.1, 'Requested quantity must be greater than 0'],
    },
    unit: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message must not exceed 500 characters'],
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    decisionAt: {
      type: Date,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    scheduledPickupAt: {
      type: Date,
      default: null,
    },
    pickupStatus: {
      type: String,
      enum: PICKUP_STATUSES,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    donorConfirmed: {
      type: Boolean,
      default: false,
    },
    donorConfirmedAt: {
      type: Date,
      default: null,
    },
    recipientConfirmed: {
      type: Boolean,
      default: false,
    },
    recipientConfirmedAt: {
      type: Date,
      default: null,
    },
    confirmationActor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    confirmationNote: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    disputeReason: {
      type: String,
      trim: true,
    },
    disputeResolvedAt: {
      type: Date,
      default: null,
    },
    disputeResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Pickup verification code (stored as hash)
    pickupCodeHash: {
      type: String,
      select: false,
    },
    pickupCodeExpiresAt: {
      type: Date,
      select: false,
    },
    pickupCodeAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donationRequestSchema.index({ listing: 1 });
donationRequestSchema.index({ recipient: 1 });
donationRequestSchema.index({ status: 1 });
donationRequestSchema.index({ createdAt: -1 });
donationRequestSchema.index({ assignedVolunteer: 1 });

// Compound index to prevent duplicate active requests
donationRequestSchema.index(
  { listing: 1, recipient: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } },
  }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
module.exports.REQUEST_STATUSES = REQUEST_STATUSES;
module.exports.PICKUP_STATUSES = PICKUP_STATUSES;
