const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

require('../setup');

const createAndLoginUser = async (role = 'household_donor', verificationStatus = 'not_required') => {
  const email = `donor_${Date.now()}_${Math.random()}@example.com`;
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const user = await User.create({
    name: 'Test Donor',
    email,
    passwordHash,
    role,
    accountStatus: 'active',
    verificationStatus,
  });
  const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password@123' });
  return { user, token: res.body.data.token };
};

describe('Listing API', () => {
  let donorToken, donorUser;

  beforeAll(async () => {
    const result = await createAndLoginUser('household_donor');
    donorToken = result.token;
    donorUser = result.user;
  });

  describe('POST /api/v1/listings', () => {
    it('creates a listing successfully', async () => {
      const future = new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString();
      const available = new Date().toISOString();
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${donorToken}`)
        .field('title', 'Test Food Item')
        .field('description', 'Fresh cooked food for donation purposes')
        .field('category', 'cooked_meals')
        .field('quantity', '5')
        .field('unit', 'meals')
        .field('availableFrom', available)
        .field('collectionDeadline', future)
        .field('pickupAddress', '123 Test Street, Test City');

      expect(res.status).toBe(201);
      expect(res.body.data.listing.title).toBe('Test Food Item');
      expect(res.body.data.listing.status).toBe('available');
    });

    it('rejects listing with past collection deadline', async () => {
      const past = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${donorToken}`)
        .field('title', 'Old Food')
        .field('description', 'Description longer than 10 chars')
        .field('category', 'cooked_meals')
        .field('quantity', '5')
        .field('unit', 'meals')
        .field('availableFrom', new Date().toISOString())
        .field('collectionDeadline', past)
        .field('pickupAddress', '123 Test Street');

      expect(res.status).toBe(400);
    });

    it('rejects invalid category', async () => {
      const future = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${donorToken}`)
        .field('title', 'Test Food')
        .field('description', 'Some description here')
        .field('category', 'invalid_category')
        .field('quantity', '5')
        .field('unit', 'meals')
        .field('availableFrom', new Date().toISOString())
        .field('collectionDeadline', future)
        .field('pickupAddress', '123 Test Street');

      expect(res.status).toBe(400);
    });

    it('rejects listing creation by NGO user', async () => {
      const { token: ngoToken } = await createAndLoginUser('ngo', 'approved');
      const future = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/listings')
        .set('Authorization', `Bearer ${ngoToken}`)
        .field('title', 'NGO Food')
        .field('description', 'Should not be allowed')
        .field('category', 'cooked_meals')
        .field('quantity', '5')
        .field('unit', 'meals')
        .field('availableFrom', new Date().toISOString())
        .field('collectionDeadline', future)
        .field('pickupAddress', '123 Test Street');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/listings', () => {
    it('returns available listings with pagination', async () => {
      const res = await request(app).get('/api/v1/listings?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.listings)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('filters by category', async () => {
      const res = await request(app).get('/api/v1/listings?category=cooked_meals');
      expect(res.status).toBe(200);
      res.body.data.listings.forEach((l) => {
        expect(l.category).toBe('cooked_meals');
      });
    });
  });
});
