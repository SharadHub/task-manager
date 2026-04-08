export function formatTime(seconds) {
  if (!seconds || seconds === 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
export const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived'
};
export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };

export const PROJECT_COLORS = [
  '#7c6af7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#8b5cf6', '#f97316', '#06b6d4'
];
export const PROJECT_ICONS = ['📁', '🚀', '💡', '🎯', '🔧', '📊', '🎨', '📝', '⚡', '🌟'];
