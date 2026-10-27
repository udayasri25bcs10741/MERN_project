const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

router.get('/verifications', adminController.getVerifications);
router.patch('/verifications/:userId', adminController.decideVerification);
router.get('/listings', adminController.getAllListings);
router.patch('/listings/:id/moderate', adminController.moderateListing);
router.get('/users', adminController.getAllUsers);
router.patch(['/users/:userId/status', '/users/:userId/suspend'], adminController.updateUserStatus);
router.patch('/users/:userId/reactivate', adminController.reactivateUser);
router.get(['/audit-logs', '/audit'], adminController.getAuditLogs);

module.exports = router;
