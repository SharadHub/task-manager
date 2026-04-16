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
    <div style={{ 
      padding: '16px', 
      flex: 1, 
      overflow: 'auto', 
      display: 'flex', 
      flexDirection: 'column',
      maxWidth: '100%'
    }}>
      {/* Header */}
      <div className="flex-responsive" style={{ 
        marginBottom: '16px',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 className="heading-responsive" style={{ 
            fontFamily: 'var(--font-display)', 
            color: 'var(--text)', 
            marginBottom: 'var(--spacing-xs)',
            lineHeight: '1.3'
          }}>
            All Tasks
          </h1>
          <div className="flex-responsive" style={{ 
            gap: 'var(--spacing-md)', 
            fontSize: 'var(--font-xs)', 
            color: 'var(--text-3)', 
            fontFamily: 'var(--font-mono)',
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}>
            <span>{counts.all} total</span>
            <span style={{ color: '#60a5fa' }}>{counts.in_progress} active</span>
            <span style={{ color: 'var(--green)' }}>{counts.completed} done</span>
          </div>
        </div>
        <button
          onClick={() => { setEditTask(null); setShowModal(true); }}
          className="btn btn-primary"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: 'var(--font-sm)',
            minWidth: '120px',
            height: '44px'
          }}
        >
          + New Task
        </button>
      </div>

      {/* Quick filter tabs - Mobile optimized */}
      <div style={{ 
        display: 'flex', 
        gap: '4px', 
        marginBottom: '12px', 
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
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
              padding: '6px 12px', 
              borderRadius: 16, 
              border: 'none',
              background: filters.status === tab.val ? 'var(--accent)' : 'var(--surface)',
              color: filters.status === tab.val ? '#fff' : 'var(--text-2)',
              fontSize: '11px', 
              cursor: 'pointer', 
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.12s',
              whiteSpace: 'nowrap',
              minHeight: '28px',
              flexShrink: 0
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Search + filters - Mobile optimized */}
      <div style={{ 
        marginBottom: '16px'
      }}>
        {/* Search bar */}
        <input
          className="tf-input"
          style={{ 
            width: '100%',
            height: '40px',
            marginBottom: '8px'
          }}
          placeholder="Search tasks..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
        />
        
        {/* Filter dropdowns in a compact row */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          flexWrap: 'wrap',
          alignItems: 'stretch'
        }}>
          <select className="tf-input" style={{ 
            flex: 1,
            minWidth: '100px',
            height: '36px',
            fontSize: '12px'
          }} value={filters.priority}
            onChange={e => setFilter('priority', e.target.value)}>
            <option value="">Priority</option>
            {['urgent', 'high', 'medium', 'low'].map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
          <select className="tf-input" style={{ 
            flex: 1,
            minWidth: '100px',
            height: '36px',
            fontSize: '12px'
          }} value={filters.project}
            onChange={e => setFilter('project', e.target.value)}>
            <option value="">Project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.icon} {p.name}</option>)}
          </select>
          <select className="tf-input" style={{ 
            flex: 1,
            minWidth: '100px',
            height: '36px',
            fontSize: '12px'
          }} value={sortBy}
            onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="time">Time</option>
          </select>
          {(filters.status || filters.priority || filters.project || filters.search) && (
            <button
              className="btn btn-ghost"
              onClick={() => setFilters({ status: '', priority: '', project: '', search: '' })}
              style={{ 
                height: '36px',
                padding: '0 12px',
                fontSize: '12px',
                minWidth: '60px'
              }}
            >Clear</button>
          )}
        </div>
      </div>

      {/* Task grid */}
      {loading ? (
        <div style={{ 
          color: 'var(--text-3)', 
          fontSize: 'var(--font-sm)', 
          fontFamily: 'var(--font-mono)', 
          padding: 'var(--spacing-lg)',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Loading tasks...
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="empty-state" style={{
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 'var(--spacing-md)', 
          padding: 'var(--spacing-xl)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '48px', 
            opacity: 0.5,
            marginBottom: 'var(--spacing-sm)'
          }}>✓</div>
          <div style={{ 
            color: 'var(--text-3)', 
            fontSize: 'var(--font-base)',
            lineHeight: '1.5'
          }}>No tasks found</div>
          <button
            onClick={() => { setEditTask(null); setShowModal(true); }}
            className="btn btn-primary"
            style={{
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              fontSize: 'var(--font-sm)',
              minHeight: '44px'
            }}
          >Create your first task</button>
        </div>
      ) : (
        <div className="task-list" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          maxWidth: '100%'
        }}>
          {sortedTasks.map(task => (
            <div key={task._id} 
                 onDoubleClick={() => { setEditTask(task); setShowModal(true); }}
                 style={{ maxWidth: '100%' }}>
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
