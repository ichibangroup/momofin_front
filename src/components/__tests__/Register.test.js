import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';
import { useNavigate } from 'react-router-dom';

// Mock useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('Register Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const heading = screen.getByRole('heading', { name: /register/i });
    expect(heading).toBeInTheDocument();

    // These should use getByPlaceholderText if not labeled by a <label>
    const usernameInput = screen.getByPlaceholderText(/username/i);  // Adjust based on actual placeholders or labels
    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /login instead/i });
    expect(loginLink).toBeInTheDocument();
  });

  test('allows input in username and password fields', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Use placeholder or labels accordingly
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });

    expect(usernameInput.value).toBe('newuser');
    expect(passwordInput.value).toBe('newpassword');
  });

  test('navigates to /app on register button click', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });

  test('renders "Login instead" link with correct "to" prop', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole('link', { name: /login instead/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});