const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  purpose: { type: String, enum: ['signup', 'login'], required: true },
  name: String,
  hashedPassword: String,
  role: String,
  expiresAt: { type: Date, required: true }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
