import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTHENTICATION
export const register = (userData) => API.post('/auth/register', userData).then(r => r.data);
export const login = (userData) => API.post('/auth/login', userData).then(r => r.data);
export const getCurrentUser = () => API.get('/auth/me').then(r => r.data);

// TASKS
export const getTasks = (params) => API.get('/tasks', { params }).then(r => r.data);
export const getTask = (id) => API.get(`/tasks/${id}`).then(r => r.data);
export const createTask = (data) => API.post('/tasks', data).then(r => r.data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data).then(r => r.data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`).then(r => r.data);
export const startTimer = (id) => API.post(`/tasks/${id}/timer/start`).then(r => r.data);
export const stopTimer = (id) => API.post(`/tasks/${id}/timer/stop`).then(r => r.data);

// PROJECTS
export const getProjects = () => API.get('/projects').then(r => r.data);
export const createProject = (data) => API.post('/projects', data).then(r => r.data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data).then(r => r.data);
export const deleteProject = (id) => API.delete(`/projects/${id}`).then(r => r.data);

// STATS
export const getOverview = () => API.get('/stats/overview').then(r => r.data);
export const getDaily = (days) => API.get('/stats/daily', { params: { days } }).then(r => r.data);
export const getPriority = () => API.get('/stats/priority').then(r => r.data);
export const getRecentActivity = () => API.get('/stats/recent').then(r => r.data);
export const getLabels = () => API.get('/stats/labels').then(r => r.data);
export const getTimeByProject = () => API.get('/stats/time-by-project').then(r => r.data);

export default API;
