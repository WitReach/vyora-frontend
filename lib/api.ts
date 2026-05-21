import axios from 'axios';

const api = axios.create({
    baseURL: typeof window !== 'undefined' ? '/api/proxy' : `${process.env.BACKEND_URL || 'http://127.0.0.1:8000'}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to attach bearer token from localStorage (via zustand or manual)
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage);
                const token = parsed?.state?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error('Error parsing auth storage', e);
            }
        }
    }
    return config;
});

export default api;
