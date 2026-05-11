import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_URL = API_BASE_URL.replace('/api', '');

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response || error);
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
};

export const routinesApi = {
    getAll: () => api.get('/routines'),
    getById: (id: number) => api.get(`/routines/${id}`),
    create: (data: any) => api.post('/routines', data),
    generate: (prompt: string, num_exercises: number = 6) => api.post('/routines/generate', { prompt, num_exercises }),
    delete: (id: number) => api.delete(`/routines/${id}`),
    togglePublish: (id: number) => api.patch(`/routines/${id}/publish`),
    updateMusic: (id: number, music_url: string) => api.patch(`/routines/${id}/music`, { music_url }),
};

export const exercisesApi = {
    getAll: (muscleGroup?: string) => api.get('/exercises', { params: { muscle_group: muscleGroup } }),
};

export const workoutsApi = {
    getSessions: (days?: number) => api.get('/workouts/sessions', { params: { days } }),
    getSessionDetail: (id: number) => api.get(`/workouts/sessions/${id}`),
    startSession: (routineId: number) => api.post('/workouts/sessions', { routine_id: routineId }),
    finishSession: (sessionId: number) => api.post(`/workouts/sessions/${sessionId}/finish`),
    logSet: (data: any) => api.post('/workouts/logs', data),
};

export const analyticsApi = {
    getVolume: (days: number = 30) => api.get('/analytics/volume', { params: { days } }),
    getProgression: (exerciseId: number, days: number = 90) =>
        api.get(`/analytics/progression/${exerciseId}`, { params: { days } }),
    getPersonalRecords: () => api.get('/analytics/personal-records'),
    getHeatmap: (days: number = 365) => api.get('/analytics/heatmap', { params: { days } }),
    getStatsSummary: () => api.get('/analytics/stats-summary'),
    getWeeklyVolume: (weeks: number = 12) => api.get('/analytics/weekly-volume', { params: { weeks } }),
    exportCsv: () => api.get('/analytics/export-csv', { responseType: 'blob' }),
    exportPdf: () => api.get('/analytics/export-pdf', { responseType: 'blob' }),
};

export const profileApi = {
    getProfile: () => api.get('/profile'),
    updateProfile: (data: any) => api.put('/profile', data),
    getShopItems: () => api.get('/profile/shop'),
    purchaseItem: (itemId: number) => api.post(`/profile/shop/purchase/${itemId}`),
    getAchievements: () => api.get('/profile/achievements'),
    getLevelRewards: () => api.get('/profile/level-rewards'),
    getBodyMetrics: () => api.get('/profile/body-metrics'),
    addBodyMetric: (data: any) => api.post('/profile/body-metrics', data),
    uploadAvatar: (formData: FormData) => api.post('/profile/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const communityApi = {
    getFeed: () => api.get('/community'),
    toggleLike: (routineId: number) => api.post(`/community/routines/${routineId}/like`),
    saveRoutine: (routineId: number) => api.post(`/community/routines/${routineId}/save`),
    getRoutineExercises: (routineId: number) => api.get(`/community/routines/${routineId}/exercises`),
    getLeaderboard: () => api.get('/community/leaderboard'),
    toggleFollow: (userId: number) => api.post(`/community/users/${userId}/follow`),
    getUserProfile: (userId: number) => api.get(`/community/users/${userId}`),
    getReviews: (routineId: number) => api.get(`/community/routines/${routineId}/reviews`),
    submitReview: (routineId: number, data: { rating: number; comment: string }) =>
        api.post(`/community/routines/${routineId}/reviews`, data),
    getFriends: () => api.get('/community/friends'),
    searchUsers: (q: string) => api.get('/community/search-users', { params: { q } }),
};

export const adminApi = {
    getUsers: () => api.get('/admin/users'),
    updateUserRole: (userId: number, role: string) => api.put(`/admin/users/${userId}/role`, { role }),
    deleteUser: (userId: number) => api.delete(`/admin/users/${userId}`),
    getCoachClients: () => api.get('/admin/coach-clients'),
    getClientStats: (clientId: number) => api.get(`/admin/coach/client/${clientId}/stats`),
    nudgeUser: (clientId: number, note: string) => api.post(`/admin/coach/client/${clientId}/nudge`, { note }),
    rewardUser: (clientId: number, amount: number) => api.post(`/admin/coach/client/${clientId}/reward`, { amount }),
    assignRoutine: (clientId: number, routineId: number) => api.post(`/admin/coach/client/${clientId}/assign-routine`, { routineId }),
    clearNudge: () => api.post('/admin/coach/clear-nudge'),
};

export default api;
