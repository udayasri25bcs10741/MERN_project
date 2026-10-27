const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');
const { authenticate, optionalAuthenticate, authorize, requireVerified } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createListingSchema, updateListingSchema, withdrawListingSchema } = require('../validators/listing.validators');
const { upload } = require('../config/cloudinary');

// Donor only: get donor's own listings (MUST be defined before /listings/:id)
router.get(
  ['/my/listings', '/listings/my'],
  authenticate,
  authorize('household_donor', 'organization_donor'),
  listingController.getMyListings
);

// Public (with optional auth to decrypt pickup address for accepted recipients/donor)
router.get('/listings', listingController.getListings);
router.get('/listings/:id', optionalAuthenticate, listingController.getListingById);

// Donor only
router.post(
  '/listings',
  authenticate,
  authorize('household_donor', 'organization_donor'),
  upload.single('image'),
  validate(createListingSchema),
  listingController.createListing
);

router.put(
  '/listings/:id',
  authenticate,
  authorize('household_donor', 'organization_donor'),
  validate(updateListingSchema),
  listingController.updateListing
);

router.patch(
  '/listings/:id',
  authenticate,
  authorize('household_donor', 'organization_donor'),
  validate(updateListingSchema),
  listingController.updateListing
);

router.post(
  ['/listings/:id/withdraw'],
  authenticate,
  authorize('household_donor', 'organization_donor'),
  validate(withdrawListingSchema),
  listingController.withdrawListing
);

router.patch(
  ['/listings/:id/withdraw'],
  authenticate,
  authorize('household_donor', 'organization_donor'),
  validate(withdrawListingSchema),
  listingController.withdrawListing
);

module.exports = router;
