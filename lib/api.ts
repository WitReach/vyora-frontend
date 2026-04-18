import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Removed withCredentials to avoid CORS wildcard blocking from Chrome
});

// Add a request interceptor to attach bearer token if we have one (for later auth)
// api.interceptors.request.use((config) => { ... });

export default api;
