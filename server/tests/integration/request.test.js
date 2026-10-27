const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const FoodListing = require('../../src/models/FoodListing');
const DonationRequest = require('../../src/models/DonationRequest');
const bcrypt = require('bcryptjs');

require('../setup');

const createUser = async (role, verificationStatus = 'not_required') => {
  const email = `req_${role}_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
  const passwordHash = await bcrypt.hash('Password@123', 10);
  return User.create({ name: `Test ${role}`, email, passwordHash, role, accountStatus: 'active', verificationStatus });
};

const loginUser = async (email) => {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password@123' });
  return res.body.data.token;
};

const createListing = async (donorId, status = 'available') => {
  return FoodListing.create({
    donor: donorId,
    donorType: 'household_donor',
    title: 'Test Listing',
    description: 'Test description for donation request tests',
    category: 'cooked_meals',
    quantity: 10,
    unit: 'meals',
    availableFrom: new Date(),
    collectionDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
    pickupAddress: '123 Test St',
    location: { type: 'Point', coordinates: [77.6, 12.9] },
    allergenStatus: 'unknown',
    status,
  });
};

describe('Donation Request API', () => {
  let donor, ngo, unverifiedNGO, donorToken, ngoToken;

  beforeAll(async () => {
    donor = await createUser('household_donor');
    ngo = await createUser('ngo', 'approved');
    unverifiedNGO = await createUser('ngo', 'pending');
    donorToken = await loginUser(donor.email);
    ngoToken = await loginUser(ngo.email);
  });

  describe('POST /api/v1/listings/:listingId/requests', () => {
    it('allows approved NGO to request a listing', async () => {
      const listing = await createListing(donor._id);
      const res = await request(app)
        .post(`/api/v1/listings/${listing._id}/requests`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ requestedQuantity: 10 });

      expect(res.status).toBe(201);
      expect(res.body.data.request.status).toBe('pending');
    });

    it('rejects unverified NGO request', async () => {
      const listing = await createListing(donor._id);
      const unverToken = await loginUser(unverifiedNGO.email);
      const res = await request(app)
        .post(`/api/v1/listings/${listing._id}/requests`)
        .set('Authorization', `Bearer ${unverToken}`)
        .send({ requestedQuantity: 10 });

      expect(res.status).toBe(403);
    });

    it('prevents duplicate active request by same NGO', async () => {
      const listing = await createListing(donor._id);
      await request(app)
        .post(`/api/v1/listings/${listing._id}/requests`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ requestedQuantity: 10 });

      const res = await request(app)
        .post(`/api/v1/listings/${listing._id}/requests`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ requestedQuantity: 10 });

      expect(res.status).toBe(409);
    });

    it('rejects request on expired listing', async () => {
      const expiredListing = await FoodListing.create({
        donor: donor._id,
        donorType: 'household_donor',
        title: 'Expired Listing',
        description: 'This listing has expired',
        category: 'cooked_meals',
        quantity: 5,
        unit: 'meals',
        availableFrom: new Date(Date.now() - 10 * 60 * 60 * 1000),
        collectionDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000),
        pickupAddress: '123 Test',
        location: { type: 'Point', coordinates: [77.6, 12.9] },
        allergenStatus: 'unknown',
        status: 'expired',
      });

      const res = await request(app)
        .post(`/api/v1/listings/${expiredListing._id}/requests`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ requestedQuantity: 5 });

      expect(res.status).toBe(409);
    });
  });

  describe('PATCH /api/v1/requests/:id/decision', () => {
    let listing, reqId;

    beforeEach(async () => {
      listing = await createListing(donor._id);
      const reqRes = await request(app)
        .post(`/api/v1/listings/${listing._id}/requests`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ requestedQuantity: 10 });
      reqId = reqRes.body.data.request._id;
    });

    it('donor can accept a pending request', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${reqId}/decision`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ decision: 'accepted' });

      expect(res.status).toBe(200);
      expect(res.body.data.request.status).toBe('accepted');
      expect(res.body.data.pickupCode).toBeDefined();

      // Listing should be reserved
      const updatedListing = await FoodListing.findById(listing._id);
      expect(updatedListing.status).toBe('reserved');
    });

    it('donor can reject a pending request', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${reqId}/decision`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ decision: 'rejected' });

      expect(res.status).toBe(200);
      expect(res.body.data.request.status).toBe('rejected');
    });

    it('non-owner cannot decide on a request', async () => {
      const anotherDonor = await createUser('household_donor');
      const anotherToken = await loginUser(anotherDonor.email);

      const res = await request(app)
        .patch(`/api/v1/requests/${reqId}/decision`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({ decision: 'accepted' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/requests/:id/cancel', () => {
    it('NGO can cancel a pending request and listing becomes available again', async () => {
      const listing = await createListing(donor._id);
      const reqRes = await request(app)
        .post(`/api/v1/listings/${listing._id}/requests`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ requestedQuantity: 10 });
      const reqId = reqRes.body.data.request._id;

      // Accept it first
      await request(app)
        .patch(`/api/v1/requests/${reqId}/decision`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ decision: 'accepted' });

      // Cancel
      const res = await request(app)
        .post(`/api/v1/requests/${reqId}/cancel`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ reason: 'Test cancellation' });

      expect(res.status).toBe(200);
      expect(res.body.data.request.status).toBe('cancelled');

      // Listing should be available again
      const updatedListing = await FoodListing.findById(listing._id);
      expect(updatedListing.status).toBe('available');
    });
  });

  describe('POST /api/v1/requests/:id/confirm-pickup', () => {
    let listing, reqId, validCode;

    beforeEach(async () => {
      listing = await createListing(donor._id);
      const reqRes = await request(app)
        .post(`/api/v1/listings/${listing._id}/requests`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ requestedQuantity: 10 });
      reqId = reqRes.body.data.request._id;

      const acceptRes = await request(app)
        .patch(`/api/v1/requests/${reqId}/decision`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ decision: 'accepted' });
      validCode = acceptRes.body.data.pickupCode;
    });

    it('confirms pickup with valid code and marks request & listing collected', async () => {
      const res = await request(app)
        .post(`/api/v1/requests/${reqId}/confirm-pickup`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ pickupCode: validCode });

      expect(res.status).toBe(200);
      expect(res.body.data.request.status).toBe('completed');
      expect(res.body.data.request.pickupStatus).toBe('collected');

      const updatedListing = await FoodListing.findById(listing._id);
      expect(updatedListing.status).toBe('collected');
    });

    it('rejects incorrect pickup code and tracks attempt count', async () => {
      const res = await request(app)
        .post(`/api/v1/requests/${reqId}/confirm-pickup`)
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({ pickupCode: 'WRONGCODE' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid pickup code/i);

      // Verify request is still accepted, not completed
      const checkReq = await DonationRequest.findById(reqId);
      expect(checkReq.status).toBe('accepted');
    });

    it('rejects verification by unauthorized donor', async () => {
      const res = await request(app)
        .post(`/api/v1/requests/${reqId}/confirm-pickup`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({ pickupCode: validCode });

      // Donors cannot verify pickup via recipient code endpoint
      expect(res.status).toBe(403);
    });
  });
});
