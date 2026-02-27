import axios from 'axios';
import useAuthStore from '../store/authStore';

const BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Public API — no auth token injected (for shared/public endpoints)
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// User
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
  checkin: (data) => api.post('/users/checkin', data),
  logSleep: (data) => api.post('/users/sleep', data),
};

// Analysis
export const analysisAPI = {
  submitQuestionnaire: (answers) => api.post('/analysis/questionnaire', { answers }),
  getAnalysis: (id) => api.get(`/analysis/${id}`),
  getUserAnalyses: () => api.get('/analysis'),
  submitVoice: (formData) => api.post('/analysis/voice', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitFacial: (formData) => api.post('/analysis/facial', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getComprehensive: () => api.post('/analysis/comprehensive'),
};

// Matches
export const matchAPI = {
  calculate: (targetUserId, matchType) => api.post('/matches/calculate', { targetUserId, matchType }),
  getMyMatches: () => api.get('/matches'),
  findCompatible: (matchType) => api.get(`/matches/find/${matchType}`),
};

// Reports
export const reportAPI = {
  getReports: () => api.get('/reports'),
  getReport: (id) => api.get(`/reports/${id}`),
  shareReport: (id) => api.post(`/reports/${id}/share`),
  getShared: (token) => publicApi.get(`/reports/shared/${token}`),
};

// Coach
export const coachAPI = {
  getDailyMessage: () => api.get('/coach/daily'),
  askCoach: (question) => api.post('/coach/ask', { question }),
  getWeeklyInsights: () => api.get('/coach/weekly-insights'),
};

// Payments
export const paymentAPI = {
  getPlans: () => api.get('/payments/plans'),
  createCheckout: (plan) => api.post('/payments/checkout', { plan }),
  getSubscription: () => api.get('/payments/subscription'),
};

// Enterprise
export const enterpriseAPI = {
  getDashboard: () => api.get('/enterprise/dashboard'),
  getHRInsights: () => api.get('/enterprise/hr-insights'),
  teamAnalysis: (teamMemberIds) => api.post('/enterprise/team-analysis', { teamMemberIds }),
  // Member management
  searchMember: (email) => api.post('/enterprise/members/search', { email }),
  addMember: (userId) => api.post('/enterprise/members/add', { userId }),
  removeMember: (userId) => api.delete(`/enterprise/members/${userId}`),
  getMembers: () => api.get('/enterprise/members'),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  extendSubscription: (id, days) => api.post(`/admin/users/${id}/extend`, { days: Number(days) }),
  resetPassword: (id, newPassword) => api.post(`/admin/users/${id}/reset-password`, { newPassword }),
};

// Community
export const communityAPI = {
  getPosts: (room) => api.get(`/community/${room}`),
  createPost: (room, content) => api.post('/community', { room, content }),
  likePost: (id) => api.post(`/community/${id}/like`),
};

export default api;
