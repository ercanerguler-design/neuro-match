const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ['user', 'enterprise', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    phone: { type: String },
    company: { type: String },
    birthDate: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''] },
    country: { type: String, default: 'TR' },
    language: { type: String, default: 'tr' },

    // Subscription
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
      status: { type: String, enum: ['active', 'inactive', 'cancelled', 'trial'], default: 'inactive' },
      startDate: { type: Date },
      endDate: { type: Date },
      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
    },

    // Neuro Profile
    neuroProfile: {
      brainType: { type: String }, // analytical, creative, empathetic, strategic
      energyRhythm: { type: String }, // morning, evening, flexible
      decisionStyle: { type: String }, // rational, intuitive, balanced
      stressResponse: { type: String }, // fight, flight, freeze, tend
      socialPattern: { type: String }, // introvert, extrovert, ambivert
      overallScore: { type: Number, default: 0 },
      lastUpdated: { type: Date },
    },

    // Daily tracking
    dailyCheckin: [
      {
        date: { type: Date },
        mood: { type: Number, min: 1, max: 10 },
        energy: { type: Number, min: 1, max: 10 },
        stress: { type: Number, min: 1, max: 10 },
        focus: { type: Number, min: 1, max: 10 },
        notes: { type: String },
      },
    ],

    // Sleep data
    sleepData: [
      {
        date: { type: Date },
        duration: { type: Number }, // hours
        quality: { type: Number, min: 1, max: 10 },
        bedTime: { type: String },
        wakeTime: { type: String },
      },
    ],

    // Auth
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate reset token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
