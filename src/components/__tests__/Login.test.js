import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { act } from 'react';

// Mock useNavigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

const renderWithRouter = (component) => {
  return {
    ...render(
        <BrowserRouter>
          {component}
        </BrowserRouter>
    ),
  };
};

describe('Login Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders the login form with username and password fields', () => {
    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test('allows the user to type a username and password', () => {
    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles valid form submission', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ token: 'fake-token' }) };
    global.fetch.mockResolvedValueOnce(mockResponse);

    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationName: 'Momofin',
        username: 'testuser',
        password: 'password123',
      }),
    });

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith('/app');
    });
  });

  test('handles login failure', async () => {
    const mockResponse = { ok: false };
    global.fetch.mockResolvedValueOnce(mockResponse);

    renderWithRouter(<Login />);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  test('does not submit form with empty fields', async () => {
    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('renders "Forgot Password?" link', () => {
    renderWithRouter(<Login />);

    const forgotPasswordLink = screen.getByText(/forgot password\?/i);

    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.getAttribute('href')).toBe('/forgot-password');
  });

  test('navigates to signup page when "Sign Up" button is clicked', () => {
    renderWithRouter(<Login />);

    const signUpButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.click(signUpButton);

    expect(mockedUsedNavigate).toHaveBeenCalledWith('/signup');
  });
});