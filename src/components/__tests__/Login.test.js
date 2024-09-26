import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../Login';

describe('Login Component', () => {
    test('renders login form', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Check if the login heading is in the document
        const heading = screen.getByText(/login/i);
        expect(heading).toBeInTheDocument();

        // Check if the username and password inputs are present
        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        expect(usernameInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();

        // Check if the login button is present
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

        // Simulate user typing
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(usernameInput.value).toBe('testuser');
        expect(passwordInput.value).toBe('password123');
    });

    test('navigates to /app on login button click', () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/login']}>
                <Login />
            </MemoryRouter>
        );

        // Get the login button
        const loginButton = screen.getByRole('button', { name: /login/i });

        // Simulate button click
        fireEvent.click(loginButton);

        // Check if the current URL is now '/app'
        expect(container.innerHTML).toMatch(/<h1>Home<\/h1>/); // Assuming the Home component has an h1 with "Home"
    });
});
