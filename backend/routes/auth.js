const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { protect } = require('../middleware/auth');

const router = express.Router();

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOTPEmail(email, otp, name) {
  await transporter.sendMail({
    from: `"TeamFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your TeamFlow verification code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#160c2e;border-radius:12px;color:#ede9fe">
        <h2 style="margin:0 0 8px;color:#ede9fe">Hi ${name || 'there'},</h2>
        <p style="color:#a78bfa;margin:0 0 24px">Your TeamFlow verification code is:</p>
        <div style="background:#221844;border-radius:8px;padding:24px;text-align:center;letter-spacing:16px;font-size:36px;font-weight:bold;color:#c4b5fd">${otp}</div>
        <p style="color:#7c3aed;font-size:13px;margin-top:20px">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `
  });
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (!email.endsWith('@ethara.ai')) {
      return res.status(400).json({ message: 'Only @ethara.ai email addresses are allowed' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndDelete({ email });
    await OTP.create({
      email,
      otp: hashOTP(otp),
      purpose: 'signup',
      name,
      hashedPassword,
      role: role || 'member',
      expiresAt
    });

    await sendOTPEmail(email, otp, name);

    res.json({ step: 'otp', message: 'Verification code sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/signup/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email, purpose: 'signup' });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Code expired or not found. Please request a new one.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
    }

    if (otpRecord.otp !== hashOTP(otp)) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    const user = await User.create({
      name: otpRecord.name,
      email,
      password: otpRecord.hashedPassword,
      role: otpRecord.role
    });

    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    if (!email.endsWith('@ethara.ai')) {
      return res.status(400).json({ message: 'Only @ethara.ai email addresses are allowed' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndDelete({ email });
    await OTP.create({
      email,
      otp: hashOTP(otp),
      purpose: 'login',
      expiresAt
    });

    await sendOTPEmail(email, otp, user.name);

    res.json({ step: 'otp', message: 'Verification code sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await OTP.findOne({ email, purpose: 'login' });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Code expired or not found. Please request a new one.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Code has expired. Please request a new one.' });
    }

    if (otpRecord.otp !== hashOTP(otp)) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    const user = await User.findOne({ email });
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      designation: user.designation,
      mobile: user.mobile,
      personalEmail: user.personalEmail,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
