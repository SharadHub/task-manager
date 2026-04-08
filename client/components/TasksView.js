'use client';
import { useEffect, useState, useCallback } from 'react';
import { getTasks, getProjects } from '../lib/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

const STATUS_OPTS = ['', 'pending', 'in_progress', 'completed', 'archived'];
const PRIORITY_OPTS = ['', 'urgent', 'high', 'medium', 'low'];

export default function TasksView({ initialFilters = {} }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    priority: '',
    project: initialFilters.project || '',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.project) params.project = filters.project;
      if (filters.search) params.search = filters.search;
      const data = await getTasks(params);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { getProjects().then(setProjects); }, []);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'priority') {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    }
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'time') return (b.timeSpent || 0) - (a.timeSpent || 0);
    return 0;
  });

  const handleUpdate = (updated) => {
    setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
  };
  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
  };
  const handleSave = (saved) => {
    setTasks(prev => {
      const exists = prev.find(t => t._id === saved._id);
      return exists ? prev.map(t => t._id === saved._id ? saved : t) : [saved, ...prev];
    });
  };

  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div style={{ padding: '28px 32px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', marginBottom: 4 }}>
            All Tasks
          </h1>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            <span>{counts.all} total</span>
            <span style={{ color: '#60a5fa' }}>{counts.in_progress} active</span>
            <span style={{ color: 'var(--green)' }}>{counts.completed} done</span>
          </div>
        </div>
        <button
          onClick={() => { setEditTask(null); setShowModal(true); }}
          className="btn btn-primary"
        >
          + New Task
        </button>
      </div>

      {/* Quick filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'All', val: '' },
          { label: 'Pending', val: 'pending' },
          { label: 'In Progress', val: 'in_progress' },
          { label: 'Completed', val: 'completed' },
          { label: 'Archived', val: 'archived' },
        ].map(tab => (
          <button
            key={tab.val}
            onClick={() => setFilter('status', tab.val)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: 'none',
              background: filters.status === tab.val ? 'var(--accent)' : 'var(--surface)',
              color: filters.status === tab.val ? '#fff' : 'var(--text-2)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              transition: 'all 0.12s',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          className="tf-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Search tasks..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        <select className="tf-input" style={{ width: 130 }} value={filters.priority}
          onChange={e => setFilter('priority', e.target.value)}>
          <option value="">All priorities</option>
          {['urgent', 'high', 'medium', 'low'].map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <select className="tf-input" style={{ width: 140 }} value={filters.project}
          onChange={e => setFilter('project', e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.icon} {p.name}</option>)}
        </select>
        <select className="tf-input" style={{ width: 130 }} value={sortBy}
          onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">By priority</option>
          <option value="title">Alphabetical</option>
          <option value="time">By time spent</option>
        </select>
        {(filters.status || filters.priority || filters.project || filters.search) && (
          <button
            className="btn btn-ghost"
            onClick={() => setFilters({ status: '', priority: '', project: '', search: '' })}
          >Clear</button>
        )}
      </div>

      {/* Task grid */}
      {loading ? (
        <div style={{ color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--font-mono)', padding: 20 }}>
          Loading tasks...
        </div>
      ) : sortedTasks.length === 0 ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40,
        }}>
          <div style={{ fontSize: 40 }}>✓</div>
          <div style={{ color: 'var(--text-3)', fontSize: 14 }}>No tasks found</div>
          <button
            onClick={() => { setEditTask(null); setShowModal(true); }}
            className="btn btn-primary"
          >Create your first task</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedTasks.map(task => (
            <div key={task._id} onDoubleClick={() => { setEditTask(task); setShowModal(true); }}>
              <TaskCard task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
