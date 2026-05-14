const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;

    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find(filter)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user._id })
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .sort({ createdAt: -1 });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, projectId, status, priority, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignedTo || null,
      projectId,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let updateData = req.body;

    if (req.user.role === 'member') {
      updateData = { status: req.body.status };
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
