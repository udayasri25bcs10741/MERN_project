const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  role: z.enum(['household_donor', 'organization_donor', 'ngo', 'volunteer'], {
    errorMap: () => ({ message: 'Invalid role. Must be household_donor, organization_donor, ngo, or volunteer.' }),
  }),
  phone: z.string().trim().optional(),
  address: z
    .union([
      z.string(),
      z.object({
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
      }),
    ])
    .optional()
    .transform((val) => {
      if (!val) return '';
      if (typeof val === 'string') return val.trim();
      return [val.address, val.city, val.state, val.postalCode].filter(Boolean).join(', ');
    }),
  organizationName: z.string().trim().optional(),
  organizationDescription: z.string().trim().optional(),
  contactPerson: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
