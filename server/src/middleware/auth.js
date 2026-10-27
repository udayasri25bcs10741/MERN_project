const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authenticate user via Bearer token.
 * Sets req.user on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid token format.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }

    const user = await User.findById(decoded.userId).select('-passwordHash -verificationNotes -verificationDocumentUrl');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
        reason: user.suspensionReason,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize by role(s).
 * Usage: authorize('admin') or authorize('ngo', 'volunteer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    // Admins have superuser privileges across all operational endpoints
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`,
    });
  };
};

/**
 * Require NGO or volunteer to be approved before performing certain actions.
 */
const requireVerified = (req, res, next) => {
  if (req.user && ['ngo', 'volunteer'].includes(req.user.role)) {
    if (req.user.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your account must be verified before performing this action.',
        verificationStatus: req.user.verificationStatus,
      });
    }
  }
  next();
};

/**
 * Optional authentication: populates req.user if valid token provided, but does not reject anonymous users.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Ignore expired/invalid token in optional auth
      return next();
    }

    const user = await User.findById(decoded.userId).select('-passwordHash -verificationNotes -verificationDocumentUrl');
    if (user && user.accountStatus !== 'suspended') {
      req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuthenticate, authorize, requireVerified };
