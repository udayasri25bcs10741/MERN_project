export const ROLES = {
  HOUSEHOLD_DONOR: 'household_donor',
  ORGANIZATION_DONOR: 'organization_donor',
  NGO: 'ngo',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.HOUSEHOLD_DONOR]: 'Household Donor',
  [ROLES.ORGANIZATION_DONOR]: 'Organization / Restaurant',
  [ROLES.NGO]: 'NGO / Food Bank',
  [ROLES.VOLUNTEER]: 'Volunteer Courier',
  [ROLES.ADMIN]: 'Platform Administrator',
};

export const CATEGORIES = [
  { value: 'cooked_meals', label: 'Cooked Meals', icon: '🍲' },
  { value: 'fruits_vegetables', label: 'Fruits & Vegetables', icon: '🥗' },
  { value: 'bakery', label: 'Bakery & Bread', icon: '🍞' },
  { value: 'dairy_bakery', label: 'Dairy & Bakery', icon: '🧀' },
  { value: 'packaged_food', label: 'Packaged Food', icon: '📦' },
  { value: 'dry_groceries', label: 'Dry Groceries & Staples', icon: '🌾' },
  { value: 'grains_staples', label: 'Grains & Staples', icon: '🌾' },
  { value: 'beverages', label: 'Beverages', icon: '🧃' },
  { value: 'other', label: 'Other', icon: '🍱' },
];

export const UNITS = [
  { value: 'meals', label: 'Meals' },
  { value: 'servings', label: 'Servings' },
  { value: 'kilograms', label: 'Kilograms (kg)' },
  { value: 'kg', label: 'kg' },
  { value: 'packages', label: 'Packages' },
  { value: 'packets', label: 'Packets' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'grams', label: 'Grams (g)' },
  { value: 'items', label: 'Individual Items' },
];

// Authoritative listing status values — must match server/src/models/FoodListing.js STATUSES
export const LISTING_STATUSES = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  COLLECTED: 'collected',
  EXPIRED: 'expired',
  WITHDRAWN: 'withdrawn',
  UNAVAILABLE: 'unavailable',
};

export const LISTING_STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  reserved: { label: 'Reserved', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  collected: { label: 'Collected', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800 border-red-300' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  unavailable: { label: 'Hidden (Admin)', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export const REQUEST_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Authoritative pickup status values matching server/src/models/DonationRequest.js
// with backward-compatible aliases for frontend views and test suites
export const PICKUP_STATUSES = {
  AWAITING_PICKUP: 'awaiting_pickup',
  PICKUP_IN_PROGRESS: 'pickup_in_progress',
  COLLECTED: 'collected',
  DISPUTED: 'disputed',

  // Legacy/alias keys for backwards compatibility with tests and UI components
  NOT_SCHEDULED: 'not_scheduled',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const PICKUP_STATUS_CONFIG = {
  awaiting_pickup: { label: 'Awaiting Pickup', color: 'bg-indigo-100 text-indigo-700' },
  pickup_in_progress: { label: 'In Transit', color: 'bg-purple-100 text-purple-700' },
  collected: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700' },
  disputed: { label: 'Disputed', color: 'bg-amber-100 text-amber-700' },

  // Legacy status configs
  not_scheduled: { label: 'Not Scheduled', color: 'bg-gray-100 text-gray-700' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

