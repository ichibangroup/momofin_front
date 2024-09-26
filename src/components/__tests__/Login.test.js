import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';
import { useNavigate } from 'react-router-dom';

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('Login Component', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        // Ensure useNavigate is mocked before each test
        useNavigate.mockReturnValue(mockNavigate);
    });

    test('renders login form', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Query the heading and login button separately
        const heading = screen.getByRole('heading', { name: /login/i });
        expect(heading).toBeInTheDocument();

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        expect(usernameInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();

        const loginButton = screen.getByRole('button', { name: /login/i });
        expect(loginButton).toBeInTheDocument();
    });

    test('allows input in username and password fields', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('password123');
    });

    test('navigates to /app on login button click', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const loginButton = screen.getByRole('button', { name: /login/i });
        fireEvent.click(loginButton);

        // Expect that useNavigate was called with "/app"
        expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
});
