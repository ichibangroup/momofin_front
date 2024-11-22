import axios from 'axios';
import { getAuthToken } from './auth';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

// Request interceptor - only handles adding the token
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    }
);

// Response interceptor - handles auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            localStorage.removeItem('jwtToken');
            const message = "Your session has expired. Please log in again.";
            window.location.href = `/login?message=${encodeURIComponent(message)}`;
        }
        return Promise.reject(error);
    }
);

export default api;