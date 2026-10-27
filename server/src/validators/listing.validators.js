const { z } = require('zod');

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

const createListingSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unit: z.enum(UNITS, { errorMap: () => ({ message: 'Invalid unit' }) }),
  availableFrom: z.coerce.date({ errorMap: () => ({ message: 'Invalid availability date' }) }),
  collectionDeadline: z.coerce.date({ errorMap: () => ({ message: 'Invalid collection deadline' }) }),
  storageCondition: z.string().trim().max(500).optional(),
  allergenInformation: z.string().trim().max(500).optional(),
  allergenStatus: z.enum(['contains_allergens', 'allergen_free', 'unknown']).default('unknown'),
  pickupAddress: z.string().trim().min(5, 'Pickup address is required').max(500),
  locationLng: z.coerce.number().optional(),
  locationLat: z.coerce.number().optional(),
}).refine(
  (data) => data.collectionDeadline > new Date(),
  { message: 'Collection deadline must be in the future', path: ['collectionDeadline'] }
).refine(
  (data) => data.collectionDeadline > data.availableFrom,
  { message: 'Collection deadline must be after availability time', path: ['collectionDeadline'] }
);

const updateListingSchema = z.object({
  title: z.string().trim().min(5).max(100).optional(),
  description: z.string().trim().min(10).max(1000).optional(),
  category: z.enum(CATEGORIES).optional(),
  quantity: z.coerce.number().positive().optional(),
  unit: z.enum(UNITS).optional(),
  availableFrom: z.coerce.date().optional(),
  collectionDeadline: z.coerce.date().optional(),
  storageCondition: z.string().trim().max(500).optional(),
  allergenInformation: z.string().trim().max(500).optional(),
  allergenStatus: z.enum(['contains_allergens', 'allergen_free', 'unknown']).optional(),
  pickupAddress: z.string().trim().min(5).max(500).optional(),
  locationLng: z.coerce.number().optional(),
  locationLat: z.coerce.number().optional(),
});

const withdrawListingSchema = z.object({
  reason: z.string().trim().min(3, 'Please provide a withdrawal reason').max(500),
});

module.exports = { createListingSchema, updateListingSchema, withdrawListingSchema };
