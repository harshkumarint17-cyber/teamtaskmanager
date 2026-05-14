const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('teamMembers', 'name email')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ teamMembers: req.user._id })
        .populate('createdBy', 'name email')
        .populate('teamMembers', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, teamMembers, deadline, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      teamMembers: teamMembers || [],
      deadline,
      status: status || 'active'
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !project.teamMembers.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Task.deleteMany({ projectId: req.params.id });

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
