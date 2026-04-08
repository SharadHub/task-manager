const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    // Attach task counts
    const withCounts = await Promise.all(projects.map(async (p) => {
      const total = await Task.countDocuments({ project: p._id });
      const completed = await Task.countDocuments({ project: p._id, status: 'completed' });
      return { ...p.toObject(), taskCount: total, completedCount: completed };
    }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    await Task.updateMany({ project: req.params.id }, { project: null });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
