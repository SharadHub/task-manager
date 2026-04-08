const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET all tasks with filters
router.get('/', async (req, res) => {
  try {
    const { status, priority, project, label, search } = req.query;
    const query = {};
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
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    
    const task = await Task.findById(req.params.id).populate('project', 'name color icon');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    await task.populate('project', 'name color icon');
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE task
router.put('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const update = { ...req.body, updatedAt: new Date() };

    // Handle status transitions
    if (req.body.status === 'in_progress') {
      const task = await Task.findById(req.params.id);
      if (!task.startedAt) update.startedAt = new Date();
    }
    if (req.body.status === 'completed') {
      update.completedAt = new Date();
      // Stop timer if running
      const task = await Task.findById(req.params.id);
      if (task.timerRunning && task.timerStartedAt) {
        const elapsed = Math.floor((new Date() - task.timerStartedAt) / 1000);
        update.timeSpent = (task.timeSpent || 0) + elapsed;
        update.timerRunning = false;
        update.timerStartedAt = null;
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('project', 'name color icon');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// START timer
router.post('/:id/timer/start', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
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
router.post('/:id/timer/stop', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const elapsed = task.timerStartedAt
      ? Math.floor((new Date() - task.timerStartedAt) / 1000)
      : 0;

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
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
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }
    
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
