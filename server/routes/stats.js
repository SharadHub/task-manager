const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.get('/overview', auth, async (req, res) => {
  try {
    const total = await Task.countDocuments({ user: req.user._id });
    const completed = await Task.countDocuments({ status: 'completed', user: req.user._id });
    const inProgress = await Task.countDocuments({ status: 'in_progress', user: req.user._id });
    const pending = await Task.countDocuments({ status: 'pending', user: req.user._id });
    const archived = await Task.countDocuments({ status: 'archived', user: req.user._id });

    // Total time spent (including running timers)
    const tasks = await Task.find({ timeSpent: { $gt: 0 }, user: req.user._id });
    let totalTime = tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);

    // Avg completion time
    const completedTasks = await Task.find({
      status: 'completed',
      startedAt: { $ne: null },
      completedAt: { $ne: null },
      user: req.user._id
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
router.get('/daily', auth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 14;
    const result = [];
    
    // Get current local date
    const now = new Date();
    const localOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localToday = new Date(now.getTime() - localOffset);
    localToday.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const dayStart = new Date(localToday);
      dayStart.setDate(localToday.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const completed = await Task.countDocuments({
        status: 'completed',
        completedAt: { $gte: dayStart, $lte: dayEnd },
        user: req.user._id
      });
      const created = await Task.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        user: req.user._id
      });

      // Format date in local timezone
      const dateStr = dayStart.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const label = dayStart.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });

      result.push({
        date: dateStr,
        label: label,
        completed,
        created
      });
    }

    // Reverse to show oldest first, newest last
    result.reverse();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Priority breakdown
router.get('/priority', auth, async (req, res) => {
  try {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const result = await Promise.all(priorities.map(async (p) => {
      const total = await Task.countDocuments({ priority: p, user: req.user._id });
      const completed = await Task.countDocuments({ priority: p, status: 'completed', user: req.user._id });
      return { priority: p, total, completed };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent activity (last completed tasks)
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tasks = await Task.find({ status: 'completed', user: req.user._id })
      .populate('project', 'name color icon')
      .sort({ completedAt: -1 })
      .limit(limit);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Labels usage
router.get('/labels', auth, async (req, res) => {
  try {
    const result = await Task.aggregate([
      { $match: { user: req.user._id } },
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
router.get('/time-by-project', auth, async (req, res) => {
  try {
    const result = await Task.aggregate([
      { $match: { project: { $ne: null }, timeSpent: { $gt: 0 }, user: req.user._id } },
      { $group: { _id: '$project', totalTime: { $sum: '$timeSpent' }, taskCount: { $sum: 1 } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $match: { 'project.user': req.user._id } },
      { $sort: { totalTime: -1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
