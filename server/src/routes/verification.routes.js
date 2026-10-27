const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// Get my verification status
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('verificationStatus role organizationName');
    res.status(200).json({ success: true, data: { verificationStatus: user.verificationStatus, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// Submit NGO verification application
router.post('/ngo', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Only NGO accounts can submit NGO verification.' });
    }
    const { organizationName, organizationDescription, contactPerson, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (organizationName) user.organizationName = organizationName;
    if (organizationDescription) user.organizationDescription = organizationDescription;
    if (contactPerson) user.contactPerson = contactPerson;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    user.verificationStatus = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Verification application submitted. An administrator will review it shortly.',
      data: { verificationStatus: user.verificationStatus },
    });
  } catch (err) {
    next(err);
  }
});

// Submit volunteer verification application
router.post('/volunteer', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ success: false, message: 'Only volunteer accounts can submit volunteer verification.' });
    }
    const { phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (phone) user.phone = phone;
    if (address) user.address = address;
    user.verificationStatus = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Authorization application submitted.',
      data: { verificationStatus: user.verificationStatus },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
