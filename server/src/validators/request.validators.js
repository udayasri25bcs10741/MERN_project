const { z } = require('zod');

const createRequestSchema = z.object({
  requestedQuantity: z.coerce.number().positive('Requested quantity must be greater than 0'),
  message: z.string().trim().max(500).optional(),
});

const decisionSchema = z.object({
  decision: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: 'Decision must be accepted or rejected' }),
  }),
  scheduledPickupAt: z.coerce.date().optional(),
});

const assignVolunteerSchema = z.object({
  volunteerId: z.string().trim().min(1, 'Volunteer ID is required'),
  scheduledPickupAt: z.coerce.date().optional(),
});

const cancelRequestSchema = z.object({
  reason: z.string().trim().min(3, 'Please provide a cancellation reason').max(500),
});

const disputeSchema = z.object({
  reason: z.enum([
    'food_not_collected',
    'incorrect_quantity',
    'incorrect_listing_info',
    'food_safety_concern',
    'other',
  ]),
  details: z.string().trim().max(500).optional(),
});

const verifyPickupSchema = z.object({
  pickupCode: z.string().trim().min(1, 'Pickup code is required'),
});

module.exports = {
  createRequestSchema,
  decisionSchema,
  assignVolunteerSchema,
  cancelRequestSchema,
  disputeSchema,
  verifyPickupSchema,
};
