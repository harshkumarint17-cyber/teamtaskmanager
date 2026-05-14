const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  designation: {
    type: String,
    enum: ['member', 'intern', 'full-time', 'IT', 'HR', 'Founder', 'CoFounder', 'CTO'],
    default: 'member'
  },
  mobile: {
    type: String,
    trim: true,
    default: ''
  },
  personalEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
