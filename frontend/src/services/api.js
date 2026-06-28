import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://careerpilot-ai-production-9f41.up.railway.app';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  analyze: (resumeId) => api.post(`/resume/analyze/${resumeId}`),
  ats: (resumeId, jobDescription) => {
    const formData = new FormData();
    formData.append('job_description', jobDescription);
    return api.post(`/resume/ats/${resumeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/resume/list'),
  delete: (id) => api.delete(`/resume/${id}`),
};

export const interviewAPI = {
  generateQuestions: (data) => api.post('/interview/generate-questions', data),
  evaluate: (data) => api.post('/interview/evaluate', data),
  getHistory: () => api.get('/interview/history'),
  getStats: () => api.get('/interview/stats'),
};

export const skillsAPI = {
  getAll: () => api.get('/skills/'),
  add: (data) => api.post('/skills/', data),
  delete: (id) => api.delete(`/skills/${id}`),
  gapAnalysis: (data) => api.post('/skills/gap-analysis', data),
  generateRoadmap: (data) => api.post('/skills/roadmap', data),
  getRoadmaps: () => api.get('/skills/roadmaps'),
};

export const chatAPI = {
  send: (data) => api.post('/chat/send', data),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
  getSessions: () => api.get('/chat/sessions'),
  deleteSession: (sessionId) => api.delete(`/chat/session/${sessionId}`),
};

export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
  uploadPhoto: (formData) => api.post('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSettings: () => api.get('/profile/settings'),
  updateSettings: (data) => api.put('/profile/settings', data),
};