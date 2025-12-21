const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Role, Status, Country, BusinessType, NotificationType } = require('../../../../common/constants');

const { Schema } = mongoose;

const verifyTokenSchema = new Schema({
  code: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, required: true },
  expire_at: { type: Date, default: () => require('dayjs')().add(5, 'minute').toDate() },
});

const notificationSchema = new Schema({
  type: { type: String, enum: Object.values(NotificationType), required: true },
  is_enabled: { type: Boolean, default: false },
});

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  full_name: { type: String, required: false },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: Object.values(Role), default: Role.CUSTOMER },
  phone_number: { type: String, required: true },
  country: { type: String, default: Country.NIGERIA },
  state: { type: String, default: null },
  city: { type: String, default: null }, // Vendor-specific but optional
  address: { type: String, default: null }, // Vendor-specific
  gender: { type: String, default: null },
  note: { type: String, default: null },
  image_url: { type: String, default: null },
  store_name: { type: String, default: null }, // Vendor-specific
  store_image: { type: String, default: null }, // Vendor-specific
  business_type: { type: String, enum: Object.values(BusinessType), default: null }, // Vendor-specific
  description: { type: String, default: null }, // Vendor-specific
  status: { type: String, enum: Object.values(Status), default: Status.PENDING }, // Vendor-specific
  billing_address: [{ type: Schema.Types.Mixed, default: [] }], // Array of addresses (objects)
  notifications: [notificationSchema],
  sub_roles: [{ type: String, default: [] }], // Assuming strings; adjust if subRoleSchema provided
  is_verified: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  is_account_suspended: { type: Boolean, default: false },
  verify_token: { type: verifyTokenSchema, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Virtual for password confirmation
userSchema.virtual('password_confirm').set(function (value) {
  this._passwordConfirm = value;
});

// Pre-save hook for password hashing and confirmation
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    if (this.password !== this._passwordConfirm) {
      return next(new Error('Passwords do not match'));
    }
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

module.exports = mongoose.model('User', userSchema);