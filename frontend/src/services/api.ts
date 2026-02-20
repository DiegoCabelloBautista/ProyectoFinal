import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
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
    delete: (id: number) => api.delete(`/routines/${id}`),
    togglePublish: (id: number) => api.patch(`/routines/${id}/publish`),
};

export const exercisesApi = {
    getAll: (muscleGroup?: string) => api.get('/exercises', { params: { muscle_group: muscleGroup } }),
};

export const workoutsApi = {
    getSessions: () => api.get('/workouts/sessions'),
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
};

export const profileApi = {
    getProfile: () => api.get('/profile'),
    updateProfile: (data: any) => api.put('/profile', data),
    getShopItems: () => api.get('/profile/shop'),
    purchaseItem: (itemId: number) => api.post(`/profile/shop/purchase/${itemId}`),
    getAchievements: () => api.get('/profile/achievements'),
    getLevelRewards: () => api.get('/profile/level-rewards'),
};

export const communityApi = {
    getFeed: () => api.get('/community'),
    toggleLike: (routineId: number) => api.post(`/community/routines/${routineId}/like`),
    saveRoutine: (routineId: number) => api.post(`/community/routines/${routineId}/save`),
    getRoutineExercises: (routineId: number) => api.get(`/community/routines/${routineId}/exercises`),
};

export default api;
