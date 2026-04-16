const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET all tasks with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, project, label, search } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (label) query.labels = label;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query)
      .populate('project', 'name color icon')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single task
router.get('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id }).populate('project', 'name color icon');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ ...req.body, user: req.user._id });
    await task.save();
    await task.populate('project', 'name color icon');
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE task
router.put('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const update = { ...req.body, updatedAt: new Date() };

    // Handle status transitions
    if (req.body.status === 'in_progress') {
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      if (!task.startedAt) update.startedAt = new Date();
    }
    if (req.body.status === 'completed') {
      update.completedAt = new Date();
      // Stop timer if running
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      if (task.timerRunning && task.timerStartedAt) {
        const elapsed = Math.floor((new Date() - task.timerStartedAt) / 1000);
        update.timeSpent = (task.timeSpent || 0) + elapsed;
        update.timerRunning = false;
        update.timerStartedAt = null;
      }
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true }
    ).populate('project', 'name color icon');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// START timer
router.post('/:id/timer/start', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        timerRunning: true,
        timerStartedAt: new Date(),
        status: 'in_progress',
        startedAt: new Date()
      },
      { new: true }
    ).populate('project', 'name color icon');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// STOP timer
router.post('/:id/timer/stop', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const elapsed = task.timerStartedAt
      ? Math.floor((new Date() - task.timerStartedAt) / 1000)
      : 0;

    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        timerRunning: false,
        timerStartedAt: null,
        timeSpent: (task.timeSpent || 0) + elapsed
      },
      { new: true }
    ).populate('project', 'name color icon');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
