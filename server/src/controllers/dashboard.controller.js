const dashboardService = require('../services/dashboard.service');

const getDonorDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDonorDashboard(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getNGODashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getNGODashboard(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getVolunteerDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getVolunteerDashboard(req.user._id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminStats();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDonorDashboard, getNGODashboard, getVolunteerDashboard, getAdminStats };
