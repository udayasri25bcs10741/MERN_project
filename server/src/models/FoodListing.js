const mongoose = require('mongoose');

const CATEGORIES = [
  'cooked_meals',
  'packaged_food',
  'bakery',
  'dairy_bakery',
  'fruits_vegetables',
  'dry_groceries',
  'grains_staples',
  'beverages',
  'other',
];
const UNITS = [
  'meals',
  'servings',
  'kilograms',
  'kg',
  'grams',
  'liters',
  'packages',
  'packets',
  'boxes',
  'items',
];
const STATUSES = ['available', 'reserved', 'collected', 'expired', 'withdrawn', 'unavailable'];
const ALLERGEN_STATUSES = ['contains_allergens', 'allergen_free', 'unknown'];

const foodListingSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donorType: {
      type: String,
      enum: ['household_donor', 'organization_donor'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      select: false,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      enum: UNITS,
      required: [true, 'Unit is required'],
    },
    availableFrom: {
      type: Date,
      required: [true, 'Availability time is required'],
    },
    collectionDeadline: {
      type: Date,
      required: [true, 'Collection deadline is required'],
    },
    storageCondition: {
      type: String,
      trim: true,
      maxlength: [500, 'Storage condition must not exceed 500 characters'],
    },
    allergenInformation: {
      type: String,
      trim: true,
      maxlength: [500, 'Allergen information must not exceed 500 characters'],
    },
    allergenStatus: {
      type: String,
      enum: ALLERGEN_STATUSES,
      default: 'unknown',
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    // GeoJSON for location-based queries (optional)
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'available',
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
    withdrawalReason: {
      type: String,
      trim: true,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    moderationReason: {
      type: String,
      trim: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
foodListingSchema.index({ status: 1 });
foodListingSchema.index({ category: 1 });
foodListingSchema.index({ donor: 1 });
foodListingSchema.index({ collectionDeadline: 1 });
foodListingSchema.index({ createdAt: -1 });
// Geospatial index (only when coordinates exist)
foodListingSchema.index({ location: '2dsphere' }, { sparse: true });

// Virtual: alias expiryDate to collectionDeadline for frontend compatibility
foodListingSchema.virtual('expiryDate').get(function () {
  return this.collectionDeadline;
});

// Virtual: check if expired at query time
foodListingSchema.virtual('isExpiredNow').get(function () {
  return this.collectionDeadline < new Date();
});

// Ensure location subdocument is omitted if coordinates are missing or invalid
foodListingSchema.pre('validate', function (next) {
  if (
    this.location &&
    (!Array.isArray(this.location.coordinates) ||
      this.location.coordinates.length !== 2 ||
      isNaN(this.location.coordinates[0]) ||
      isNaN(this.location.coordinates[1]))
  ) {
    this.location = undefined;
  }
  next();
});

module.exports = mongoose.model('FoodListing', foodListingSchema);

module.exports.CATEGORIES = CATEGORIES;
module.exports.UNITS = UNITS;
module.exports.STATUSES = STATUSES;
