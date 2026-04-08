const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.get('/overview', async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: 'completed' });
    const inProgress = await Task.countDocuments({ status: 'in_progress' });
    const pending = await Task.countDocuments({ status: 'pending' });
    const archived = await Task.countDocuments({ status: 'archived' });

    // Total time spent (including running timers)
    const tasks = await Task.find({ timeSpent: { $gt: 0 } });
    let totalTime = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);

    // Avg completion time
    const completedTasks = await Task.find({
      status: 'completed',
      startedAt: { $ne: null },
      completedAt: { $ne: null }
    });
    let avgTime = 0;
    if (completedTasks.length > 0) {
      const totalMs = completedTasks.reduce((sum, t) => {
        return sum + (t.completedAt - t.startedAt);
      }, 0);
      avgTime = Math.floor(totalMs / completedTasks.length / 1000);
    }

    res.json({ total, completed, inProgress, pending, archived, totalTime, avgTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily completion trend (last 14 days)
router.get('/daily', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const completed = await Task.countDocuments({
        status: 'completed',
        completedAt: { $gte: dayStart, $lte: dayEnd }
      });
      const created = await Task.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      result.push({
        date: dayStart.toISOString().split('T')[0],
        label: dayStart.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
        completed,
        created
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Priority breakdown
router.get('/priority', async (req, res) => {
  try {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const result = await Promise.all(priorities.map(async (p) => {
      const total = await Task.countDocuments({ priority: p });
      const completed = await Task.countDocuments({ priority: p, status: 'completed' });
      return { priority: p, total, completed };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent activity (last completed tasks)
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tasks = await Task.find({ status: 'completed' })
      .populate('project', 'name color icon')
      .sort({ completedAt: -1 })
      .limit(limit);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Labels usage
router.get('/labels', async (req, res) => {
  try {
    const result = await Task.aggregate([
      { $unwind: '$labels' },
      { $group: { _id: '$labels', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);
    res.json(result.map(r => ({ label: r._id, count: r.count })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Time tracking per project
router.get('/time-by-project', async (req, res) => {
  try {
    const result = await Task.aggregate([
      { $match: { project: { $ne: null }, timeSpent: { $gt: 0 } } },
      { $group: { _id: '$project', totalTime: { $sum: '$timeSpent' }, taskCount: { $sum: 1 } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $sort: { totalTime: -1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
