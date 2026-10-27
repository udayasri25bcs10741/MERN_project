const requestService = require('../services/request.service');

const createRequest = async (req, res, next) => {
  try {
    const listingId = req.params.listingId || req.body.listingId;
    const request = await requestService.createRequest(listingId, req.user._id, req.body);
    res.status(201).json({ success: true, message: 'Request submitted.', data: { request } });
  } catch (err) {
    next(err);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.getRequestById(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: { request } });
  } catch (err) {
    next(err);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const result = await requestService.getMyRequests(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getIncomingRequests = async (req, res, next) => {
  try {
    const result = await requestService.getIncomingRequests(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const decideRequest = async (req, res, next) => {
  try {
    const { request, pickupCode } = await requestService.decideRequest(req.params.id, req.user._id, req.body);
    const responseData = { request };
    if (pickupCode) {
      // Return code once — recipient must save it
      responseData.pickupCode = pickupCode;
      responseData.pickupCodeNote =
        'Save this code. Share it with the volunteer at pickup. It will not be shown again.';
    }
    res.status(200).json({
      success: true,
      message: `Request ${req.body.decision}.`,
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
};

const cancelRequest = async (req, res, next) => {
  try {
    const request = await requestService.cancelRequest(req.params.id, req.user._id, req.body.reason);
    res.status(200).json({ success: true, message: 'Request cancelled.', data: { request } });
  } catch (err) {
    next(err);
  }
};

const assignVolunteer = async (req, res, next) => {
  try {
    const request = await requestService.assignVolunteer(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, message: 'Volunteer assigned.', data: { request } });
  } catch (err) {
    next(err);
  }
};

const confirmPickup = async (req, res, next) => {
  try {
    const request = await requestService.confirmPickup(req.params.id, req.user._id, req.body.pickupCode);
    res.status(200).json({ success: true, message: 'Pickup confirmed successfully.', data: { request } });
  } catch (err) {
    next(err);
  }
};

const confirmPickupManual = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const result = await requestService.confirmPickupManual(req.params.id, req.user._id, isAdmin);
    const message = result.completed
      ? 'Pickup confirmed and completed.'
      : `Confirmation recorded. Waiting for ${result.waitingFor} to confirm.`;
    res.status(200).json({ success: true, message, data: { request: result.request, completed: result.completed } });
  } catch (err) {
    next(err);
  }
};

const disputePickup = async (req, res, next) => {
  try {
    const request = await requestService.disputePickup(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, message: 'Dispute filed.', data: { request } });
  } catch (err) {
    next(err);
  }
};

const getAssignedPickups = async (req, res, next) => {
  try {
    const result = await requestService.getAssignedPickups(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRequest,
  getRequestById,
  getMyRequests,
  getIncomingRequests,
  decideRequest,
  cancelRequest,
  assignVolunteer,
  confirmPickup,
  confirmPickupManual,
  disputePickup,
  getAssignedPickups,
};
