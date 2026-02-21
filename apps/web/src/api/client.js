import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(cfg => {
  const t = useAuthStore.getState().token;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) { useAuthStore.getState().logout(); window.location.href = '/login'; }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  login:    d => api.post('/auth/login', d),
  register: d => api.post('/auth/register', d),
  me:       () => api.get('/auth/me'),
};

export const projectsAPI = {
  getAll:  ()         => api.get('/projects'),
  getById: id         => api.get(`/projects/${id}`),
  create:  d          => api.post('/projects', d),
  update:  (id, d)    => api.patch(`/projects/${id}`, d),
  delete:  id         => api.delete(`/projects/${id}`),
};

export const tasksAPI = {
  create:      d          => api.post('/tasks', d),
  update:      (id, d)    => api.patch(`/tasks/${id}`, d),
  delete:      id         => api.delete(`/tasks/${id}`),
  getComments: id         => api.get(`/tasks/${id}/comments`),
  addComment:  (id, c)    => api.post(`/tasks/${id}/comments`, { content: c }),
};

export const usersAPI = {
  getTeam:  () => api.get('/users/team'),
  updateMe: d  => api.patch('/users/me', d),
};
