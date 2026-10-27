const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard/donor', authenticate, authorize('household_donor', 'organization_donor'), dashboardController.getDonorDashboard);
router.get(['/dashboard/recipient', '/dashboard/ngo'], authenticate, authorize('ngo'), dashboardController.getNGODashboard);
router.get('/dashboard/volunteer', authenticate, authorize('volunteer'), dashboardController.getVolunteerDashboard);
router.get(['/admin/stats', '/dashboard/admin'], authenticate, authorize('admin'), dashboardController.getAdminStats);

module.exports = router;
