import React from 'react';
import { render } from '@testing-library/react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from '../auth';
import ProtectedRoute from '../ProtectedRoute';

jest.mock('react-router-dom', () => ({
    Navigate: jest.fn(() => null),
    useLocation: jest.fn()
}));

jest.mock('../auth', () => ({
    getAuthToken: jest.fn()
}));

describe('ProtectedRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useLocation.mockReturnValue({ pathname: '/test-path' });
    });

    test('renders children when token exists', () => {
        getAuthToken.mockReturnValue('valid-token');

        const TestChild = () => <div>Protected Content</div>;
        const { getByText } = render(
            <ProtectedRoute>
                <TestChild />
            </ProtectedRoute>
        );

        expect(getByText('Protected Content')).toBeInTheDocument();
        expect(Navigate).not.toHaveBeenCalled();
    });

    test('redirects to login when no token exists', () => {
        getAuthToken.mockReturnValue(null);

        render(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        expect(Navigate).toHaveBeenCalledWith({
            to: '/login',
            state: {
                from: '/test-path',
                message: 'You are currently unauthenticated.'
            },
            replace: true
        }, {});
    });
});