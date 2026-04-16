const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'archived'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  labels: [{ type: String, trim: true }],
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Time tracking
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  timeSpent: { type: Number, default: 0 }, // seconds
  timerRunning: { type: Boolean, default: false },
  timerStartedAt: { type: Date, default: null },

  dueDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
