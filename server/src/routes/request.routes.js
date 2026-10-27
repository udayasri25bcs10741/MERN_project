const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const { authenticate, authorize, requireVerified } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createRequestSchema,
  decisionSchema,
  assignVolunteerSchema,
  cancelRequestSchema,
  disputeSchema,
  verifyPickupSchema,
} = require('../validators/request.validators');

// Create request (NGO only, verified)
router.post(
  ['/requests', '/listings/:listingId/requests'],
  authenticate,
  authorize('ngo'),
  requireVerified,
  validate(createRequestSchema),
  requestController.createRequest
);

// My requests (NGO view) — MUST be defined before /requests/:id
router.get(
  ['/my/requests', '/requests/my'],
  authenticate,
  authorize('ngo'),
  requestController.getMyRequests
);

// Incoming requests (donor view) — MUST be defined before /requests/:id
router.get(
  ['/my/incoming-requests', '/requests/incoming'],
  authenticate,
  authorize('household_donor', 'organization_donor'),
  requestController.getIncomingRequests
);

// Get a specific request (Participants + Admin)
router.get('/requests/:id', authenticate, requestController.getRequestById);

// Donor decision (accept/reject)
router.patch(
  '/requests/:id/decision',
  authenticate,
  authorize('household_donor', 'organization_donor'),
  validate(decisionSchema),
  requestController.decideRequest
);

// Cancel request (NGO) — supports both PATCH and POST for backward compatibility
router.patch(
  '/requests/:id/cancel',
  authenticate,
  authorize('ngo'),
  validate(cancelRequestSchema),
  requestController.cancelRequest
);
router.post(
  '/requests/:id/cancel',
  authenticate,
  authorize('ngo'),
  validate(cancelRequestSchema),
  requestController.cancelRequest
);

// Assign volunteer (NGO)
router.patch(
  ['/requests/:id/assign-volunteer', '/requests/:id/assign'],
  authenticate,
  authorize('ngo'),
  validate(assignVolunteerSchema),
  requestController.assignVolunteer
);

// Confirm pickup via code
router.post(
  '/requests/:id/confirm-pickup',
  authenticate,
  authorize('ngo', 'volunteer'),
  validate(verifyPickupSchema),
  requestController.confirmPickup
);

// Manual confirmation (donor, NGO, volunteer, or admin)
router.post(
  '/requests/:id/confirm-pickup-manual',
  authenticate,
  authorize('household_donor', 'organization_donor', 'ngo', 'volunteer', 'admin'),
  requestController.confirmPickupManual
);

// Dispute
router.post(
  '/requests/:id/dispute',
  authenticate,
  validate(disputeSchema),
  requestController.disputePickup
);

// Volunteer assigned pickups
router.get(
  ['/my/pickups', '/requests/assigned'],
  authenticate,
  authorize('volunteer'),
  requestController.getAssignedPickups
);

module.exports = router;
