// src/models/User.js
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/hashPassword');

const { Schema } = mongoose;

// Role constants
const Role = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
};

// Vendor status
const Status = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Country defaults
const Country = {
  NIGERIA: 'Nigeria',
  // Add more countries as needed
};

const userSchema = new Schema(
  {
    // Core authentication fields
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Hidden by default in queries
    },

    // Role & status
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.CUSTOMER,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_account_suspended: {
      type: Boolean,
      default: false,
    },

    // Profile information (filled after OTP verification)
    first_name: { type: String },
    last_name: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', null],
      default: null,
    },
    country: {
      type: String,
      default: Country.NIGERIA,
    },
    state: { type: String },
    city: { type: String },
    image_url: { type: String },
    note: { type: String },

    // Vendor-specific fields
    store_name: { type: String },
    store_image: { type: String },
    address: { type: String },
    business_type: {
      type: String,
      enum: ['individual business', 'registered business', null],
      default: null,
    },
    description: { type: String },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.PENDING,
    },

    // Customer billing addresses
    billing_address: [
      {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        is_default: { type: Boolean, default: false },
      },
    ],

    // Token revocation control
    refresh_token_version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Computed full_name from first_name + last_name
userSchema.virtual('full_name').get(function () {
  if (this.first_name && this.last_name) {
    return `${this.first_name.trim()} ${this.last_name.trim()}`;
  }
  return null;
});

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await hashPassword(this.password);
  }
  next();
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ phone_number: 1 });
userSchema.index({ role: 1 });
userSchema.index({ is_verified: 1 });

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  Role,
  Status,
  Country,
};