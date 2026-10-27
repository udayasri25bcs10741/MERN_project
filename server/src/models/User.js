const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['household_donor', 'organization_donor', 'ngo', 'volunteer', 'admin'],
      required: true,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
    },
    suspensionReason: {
      type: String,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['not_required', 'pending', 'approved', 'rejected'],
      default: function () {
        return ['ngo', 'volunteer'].includes(this.role) ? 'pending' : 'not_required';
      },
    },
    verificationNotes: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    // Organization-specific fields
    organizationName: {
      type: String,
      trim: true,
    },
    organizationDescription: {
      type: String,
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    // Verification document (NGO)
    verificationDocumentUrl: {
      type: String,
      select: false,
    },
    isDemoAccount: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ verificationStatus: 1 });

// Instance method - check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Safe profile (without sensitive fields)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.verificationNotes;
  delete obj.verificationDocumentUrl;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
