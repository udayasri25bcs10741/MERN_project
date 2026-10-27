const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

require('../setup');

const makeUser = async (overrides = {}) => {
  const defaults = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    passwordHash: await bcrypt.hash('Password@123', 10),
    role: 'household_donor',
    accountStatus: 'active',
    verificationStatus: 'not_required',
  };
  return User.create({ ...defaults, ...overrides });
};

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('registers a household donor successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Alice Donor',
        email: `alice_${Date.now()}@example.com`,
        password: 'Password@123',
        role: 'household_donor',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('registers an NGO with pending verification', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test NGO',
        email: `ngo_${Date.now()}@example.com`,
        password: 'Password@123',
        role: 'ngo',
        organizationName: 'Test Org',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.user.verificationStatus).toBe('pending');
    });

    it('rejects registration with invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Bad User',
        email: 'not-an-email',
        password: 'Password@123',
        role: 'household_donor',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects short password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Short Pass',
        email: `short_${Date.now()}@example.com`,
        password: '123',
        role: 'household_donor',
      });
      expect(res.status).toBe(400);
    });

    it('rejects duplicate email', async () => {
      const email = `dup_${Date.now()}@example.com`;
      await request(app).post('/api/v1/auth/register').send({
        name: 'User 1',
        email,
        password: 'Password@123',
        role: 'household_donor',
      });
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'User 2',
        email,
        password: 'Password@123',
        role: 'household_donor',
      });
      expect(res.status).toBe(409);
    });

    it('does not allow admin role registration', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Evil Admin',
        email: `admin_${Date.now()}@example.com`,
        password: 'Password@123',
        role: 'admin',
      });
      expect(res.status).toBe(400); // Zod rejects 'admin' from enum
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testEmail;
    beforeAll(async () => {
      testEmail = `login_${Date.now()}@example.com`;
      await makeUser({ email: testEmail });
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testEmail,
        password: 'Password@123',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: testEmail,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });

    it('rejects non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'Password@123',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns user profile for authenticated user', async () => {
      const email = `me_${Date.now()}@example.com`;
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Me User',
        email,
        password: 'Password@123',
        role: 'household_donor',
      });
      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
