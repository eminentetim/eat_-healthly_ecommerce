const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: false, // Requires OTP verification
    },
    isApproved: {
      type: Boolean,
      default: false, // Vendor only – admin approval
    },
    profile: {
      fullName: String,
      phone: String,
      avatar: String,
    },
  },
  { timestamps: true }
);

// Hash password if modified (future use)
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Index for fast lookup
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);