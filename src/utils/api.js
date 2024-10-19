import axios from 'axios';
import { getAuthToken } from './auth';

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('jwtToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;