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
  address: z.string().trim().optional(),
  organizationName: z.string().trim().optional(),
  organizationDescription: z.string().trim().optional(),
  contactPerson: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
