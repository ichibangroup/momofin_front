import axios from 'axios';
import { getAuthToken } from './auth';
import log from './logger';

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
        log.info("Sending API request", { url: config.url, method: config.method, headers: config.headers });
        return config;
    },
    (error) => {
        log.error("Request error", error);
        return Promise.reject(error);
    }
);

// Response interceptor - handles auth errors
api.interceptors.response.use(
    (response) => {
        log.info("API response received", { url: response.config.url, status: response.status, data: response.data });
        return response;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('jwtToken');
            const message = "Your session has expired. Please log in again.";
            window.location.href = `/login?message=${encodeURIComponent(message)}`;
            log.warn("User session expired - redirecting to login", { status: error.response.status });
        }else {
            log.error("API response error", { url: error.config?.url, status: error.response?.status, message: error.message });
        }
        return Promise.reject(error);
    }
);

export default api;