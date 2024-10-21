import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from '../api';
import { getAuthToken } from '../auth';

// Mock the auth module
jest.mock('../auth', () => ({
    getAuthToken: jest.fn(),
}));

// Mock window.location
const mockLocation = {
    href: '',
};
delete window.location;
window.location = mockLocation;

describe('API Configuration', () => {
    let mockAxios;

    beforeEach(() => {
        mockAxios = new MockAdapter(api);
        jest.clearAllMocks();
        window.location.href = '';
        localStorage.clear();
    });

    afterEach(() => {
        mockAxios.reset();
    });

    describe('Base Configuration', () => {
        it('should create an axios instance with correct base URL', () => {
            expect(api.defaults.baseURL).toBe('https://momofin-trust-service-897144390110.asia-southeast2.run.app');
        });
    });

    describe('Request Interceptor', () => {
        it('should add authorization header when token exists', async () => {
            const mockToken = 'test-token';
            getAuthToken.mockReturnValue(mockToken);

            mockAxios.onGet('/test').reply(200);

            await api.get('/test');

            const lastRequest = mockAxios.history.get[0];
            expect(lastRequest.headers['Authorization']).toBe(`Bearer ${mockToken}`);
        });

        it('should not add authorization header when token does not exist', async () => {
            getAuthToken.mockReturnValue(null);

            mockAxios.onGet('/test').reply(200);

            await api.get('/test');

            const lastRequest = mockAxios.history.get[0];
            expect(lastRequest.headers['Authorization']).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            // Set a token in localStorage before each test
            localStorage.setItem('jwtToken', 'test-token');
        });

        it('should handle 401 unauthorized error', async () => {
            mockAxios.onGet('/test').reply(401);

            try {
                await api.get('/test');
                fail('Expected request to fail');
            } catch (error) {
                // Check that token was removed from localStorage
                expect(localStorage.getItem('jwtToken')).toBeNull();
                expect(window.location.href).toBe(
                    '/login?message=Your%20session%20has%20expired.%20Please%20log%20in%20again.'
                );
            }
        });

        it('should handle 403 forbidden error', async () => {
            mockAxios.onGet('/test').reply(403);

            try {
                await api.get('/test');
                fail('Expected request to fail');
            } catch (error) {
                // Check that token was removed from localStorage
                expect(localStorage.getItem('jwtToken')).toBeNull();
                expect(window.location.href).toBe(
                    '/login?message=Your%20session%20has%20expired.%20Please%20log%20in%20again.'
                );
            }
        });

        it('should pass through other errors', async () => {
            const errorMessage = 'Network Error';
            mockAxios.onGet('/test').networkError();

            try {
                await api.get('/test');
                fail('Expected request to fail');
            } catch (error) {
                // Token should still be in localStorage
                expect(localStorage.getItem('jwtToken')).toBe('test-token');
                expect(window.location.href).toBe('');
            }
        });
    });

    describe('Integration Tests', () => {
        it('should successfully make API calls with proper configuration', async () => {
            const mockToken = 'test-token';
            const mockResponse = { data: 'test data' };

            getAuthToken.mockReturnValue(mockToken);
            mockAxios.onGet('/test').reply(200, mockResponse);

            const response = await api.get('/test');

            expect(response.data).toEqual(mockResponse);
            expect(mockAxios.history.get[0].headers['Authorization']).toBe(`Bearer ${mockToken}`);
        });

        it('should handle failed API calls appropriately', async () => {
            const mockToken = 'test-token';
            localStorage.setItem('jwtToken', mockToken);
            getAuthToken.mockReturnValue(mockToken);
            mockAxios.onGet('/test').reply(500);

            try {
                await api.get('/test');
                fail('Expected request to fail');
            } catch (error) {
                expect(error.response.status).toBe(500);
                // Token should still be in localStorage for non-auth errors
                expect(localStorage.getItem('jwtToken')).toBe(mockToken);
            }
        });
    });
});