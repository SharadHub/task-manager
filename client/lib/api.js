import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

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
