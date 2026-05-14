const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/superAdmin');

const router = express.Router();

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, mobile, personalEmail, avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, mobile, personalEmail, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/role', protect, superAdminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or member.' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.email === 'outreach@ethara.ai') {
      return res.status(403).json({ message: 'Cannot modify super admin role.' });
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/designation', protect, superAdminOnly, async (req, res) => {
  try {
    const { designation } = req.body;
    const valid = ['member', 'intern', 'full-time', 'IT', 'HR', 'Founder', 'CoFounder', 'CTO'];
    if (!valid.includes(designation)) {
      return res.status(400).json({ message: 'Invalid designation.' });
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { designation }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, superAdminOnly, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target.email === 'outreach@ethara.ai') {
      return res.status(403).json({ message: 'Cannot delete super admin.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
