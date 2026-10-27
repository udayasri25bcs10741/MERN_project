const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const registerUser = async ({ name, email, password, role, phone, address, organizationName, organizationDescription, contactPerson }) => {
  // Check duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  // Server enforces no admin registration via public endpoint
  if (role === 'admin') {
    const err = new Error('Admin accounts cannot be created via public registration.');
    err.statusCode = 403;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const verificationStatus = ['ngo', 'volunteer'].includes(role) ? 'pending' : 'not_required';

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    phone,
    address,
    organizationName,
    organizationDescription,
    contactPerson,
    verificationStatus,
  });

  const token = generateToken(user._id);
  return { user: user.toSafeObject(), token };
};

const loginUser = async ({ email, password }) => {
  // Include passwordHash for comparison
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  if (user.accountStatus === 'suspended') {
    const err = new Error('Your account has been suspended. Please contact support.');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user._id);
  const safeUser = user.toSafeObject();
  return { user: safeUser, token };
};

const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash -verificationNotes -verificationDocumentUrl');
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { registerUser, loginUser, getMe };
