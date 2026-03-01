import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/colors';

const API_BASE_CANDIDATES = Array.from(
  new Set([
    'https://neuro-backend.vercel.app/api/v1',
    API_URL,
    'https://x-neu.com/api/v1',
    'https://www.x-neu.com/api/v1',
    'https://neuro-fronted.vercel.app/api/v1',
  ])
);

let activeBaseURL = API_BASE_CANDIDATES[0];

const LAST_GOOD_BASE_KEY = 'xneu_last_good_base';
let activeBaseInitialized = false;

const initActiveBase = async () => {
  if (activeBaseInitialized) return;
  activeBaseInitialized = true;
  const lastGood = await SecureStore.getItemAsync(LAST_GOOD_BASE_KEY);
  if (lastGood && API_BASE_CANDIDATES.includes(lastGood)) {
    activeBaseURL = lastGood;
  }
};

const persistActiveBase = async (baseURL?: string) => {
  if (!baseURL) return;
  if (!API_BASE_CANDIDATES.includes(baseURL)) return;
  activeBaseURL = baseURL;
  await SecureStore.setItemAsync(LAST_GOOD_BASE_KEY, baseURL);
};

const shouldRetryWithNextBase = (status?: number) => {
  if (!status) return true;
  return [404, 405, 429, 500, 502, 503, 504].includes(status);
};

const api = axios.create({
  baseURL: activeBaseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Token'ı her isteğe ekle
api.interceptors.request.use(async (config) => {
  await initActiveBase();
  config.baseURL = config.baseURL || activeBaseURL;
  const token = await SecureStore.getItemAsync('xneu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 gelirse logout
api.interceptors.response.use(
  async (res) => {
    const usedBase = res.config?.baseURL;
    await persistActiveBase(usedBase);
    return res;
  },
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      await SecureStore.deleteItemAsync('xneu_token');
      return Promise.reject(error);
    }

    const originalConfig = error.config || {};
    const currentBase = originalConfig.baseURL || activeBaseURL;
    const triedBases: string[] = originalConfig.__triedBases || [];

    if (shouldRetryWithNextBase(status)) {
      const nextBase = API_BASE_CANDIDATES.find(
        (base) => base !== currentBase && !triedBases.includes(base)
      );

      if (nextBase) {
        originalConfig.__triedBases = [...triedBases, currentBase];
        originalConfig.baseURL = nextBase;
        await persistActiveBase(nextBase);
        return api.request(originalConfig);
      }
    }

    return Promise.reject(error);
  }
);

export const getHumanReadableApiError = (error: any, fallback: string) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;

  if (!status) {
    return 'Sunucuya bağlanılamadı. İnternet bağlantını kontrol edip tekrar dene.';
  }

  if (status >= 500) {
    return 'Sunucuda geçici bir hata oluştu. Lütfen birazdan tekrar dene.';
  }

  if (status === 429) {
    return 'Çok fazla deneme yapıldı. Lütfen kısa süre sonra tekrar dene.';
  }

  return fallback;
};

// ── AUTH ──
export const authAPI = {
  register: (data: { name: string; email: string; password: string; gender?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

// ── USER ──
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
  checkin: (data: { mood: number; energy: number; stress: number; focus: number; notes?: string }) =>
    api.post('/users/checkin', data),
  logSleep: (data: { duration: number; quality: number; bedTime: string; wakeTime: string }) =>
    api.post('/users/sleep', data),
};

// ── ANALYSIS ──
export const analysisAPI = {
  submitQuestionnaire: (answers: any[]) =>
    api.post('/analysis/questionnaire', { answers }),
  getAnalysis: (id: string) => api.get(`/analysis/${id}`),
  getUserAnalyses: () => api.get('/analysis'),
};

// ── MATCHES ──
export const matchAPI = {
  calculate: (targetUserId: string, matchType: string = 'professional') =>
    api.post('/matches/calculate', { targetUserId, matchType }),
  getMyMatches: () => api.get('/matches'),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
};

// ── COACH (AI) ──
export const coachAPI = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post('/coach/chat', { message, sessionId }),
  getHistory: () => api.get('/coach/history'),
};

// ── REPORTS ──
export const reportAPI = {
  getMyReports: () => api.get('/reports'),
  getReport: (id: string) => api.get(`/reports/${id}`),
  createShare: (id: string) => api.post(`/reports/${id}/share`),
  getShared: (token: string) => api.get(`/reports/shared/${token}`),
};

// ── COMMUNITY ──
export const communityAPI = {
  getPosts: (room: 'analytical' | 'creative' | 'empathetic' | 'strategic') =>
    api.get(`/community/${room}`),
  createPost: (room: 'analytical' | 'creative' | 'empathetic' | 'strategic', content: string) =>
    api.post(`/community/${room}`, { content }),
  likePost: (postId: string) => api.post(`/community/posts/${postId}/like`),
};

// ── PAYMENTS ──
export const paymentAPI = {
  getPlans: () => api.get('/payments/plans'),
  createCheckout: (plan: 'basic' | 'premium' | 'enterprise') =>
    api.post('/payments/checkout', { plan }),
};

// ── ENTERPRISE ──
export const enterpriseAPI = {
  getDashboard: () => api.get('/enterprise/dashboard'),
  getMembers: () => api.get('/enterprise/members'),
  searchMember: (email: string) => api.post('/enterprise/members/search', { email }),
  addMember: (userId: string) => api.post('/enterprise/members/add', { userId }),
  removeMember: (userId: string) => api.delete(`/enterprise/members/${userId}`),
  teamAnalysis: (memberIds?: string[]) => api.post('/enterprise/team-analysis', { memberIds }),
  getHRInsights: () => api.get('/enterprise/hr-insights'),
};

// ── ADMIN ──
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string; plan?: string }) =>
    api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  createUser: (data: any) => api.post('/admin/users', data),
};

export default api;
