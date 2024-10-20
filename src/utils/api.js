import axios from 'axios';
import { getAuthToken } from './auth';

const api = axios.create({
    baseURL: 'https://minor-phedra-sirered-14f3fd33.koyeb.app',
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
        return Promise.reject(error);
    }
);

export default api;