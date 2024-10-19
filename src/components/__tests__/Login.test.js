import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { act } from 'react';
import api from '../../utils/api';
import { setAuthToken } from '../../utils/auth';

// Mock modules
jest.mock('../../utils/api');
jest.mock('../../utils/auth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
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
    jest.clearAllMocks();
  });

  test('renders the login form with organization name, username, and password fields', () => {
    renderWithRouter(<Login />);

    expect(screen.getByPlaceholderText(/organization name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  test('allows the user to type organization name, username, and password', () => {
    renderWithRouter(<Login />);

    const orgInput = screen.getByPlaceholderText(/organization name/i);
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(orgInput, { target: { value: 'TestOrg' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(orgInput.value).toBe('TestOrg');
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles valid form submission', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    api.post.mockResolvedValueOnce({ status: 200, data: { jwt: 'fake-token' } });

    renderWithRouter(<Login />);

    const orgInput = screen.getByPlaceholderText(/organization name/i);
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(orgInput, { target: { value: 'TestOrg' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      organizationName: 'TestOrg',
      username: 'testuser',
      password: 'password123',
    });

    await waitFor(() => {
      expect(setAuthToken).toHaveBeenCalledWith('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  test('handles login failure', async () => {
    api.post.mockRejectedValueOnce(new Error('Login failed'));

    renderWithRouter(<Login />);

    const orgInput = screen.getByPlaceholderText(/organization name/i);
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(orgInput, { target: { value: 'TestOrg' } });
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

    expect(api.post).not.toHaveBeenCalled();
  });

  test('renders "Forgot Password?" link', () => {
    renderWithRouter(<Login />);

    const forgotPasswordLink = screen.getByText(/forgot password\?/i);

    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.getAttribute('href')).toBe('/forgot-password');
  });
});