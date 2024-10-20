import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {BrowserRouter, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import Login from '../Login';
import { act } from 'react';
import api from '../../utils/api';
import { setAuthToken } from '../../utils/auth';

// Mock modules
jest.mock('../../utils/api');
jest.mock('../../utils/auth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  useSearchParams: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
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
  const mockNavigate = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ state: null, search: '' });
    useSearchParams.mockReturnValue([new URLSearchParams(), jest.fn()]);

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

  test('displays auth message from URL params', () => {
    const message = 'Session expired';
    require('react-router-dom').useSearchParams.mockImplementation(() => [
      new URLSearchParams(`?message=${encodeURIComponent(message)}`),
      jest.fn()
    ]);

    renderWithRouter(<Login />);

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('displays auth message from location state', () => {
    const message = 'Please log in';
    require('react-router-dom').useLocation.mockImplementation(() => ({
      state: { message },
      search: ''
    }));

    renderWithRouter(<Login />);

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('redirects to original location after successful login', async () => {
    const mockResponse = {
      data: { jwt: 'test-token' },
      status: 200
    };
    api.post.mockResolvedValueOnce(mockResponse);

    require('react-router-dom').useLocation.mockImplementation(() => ({
      state: { from: '/protected-page' },
      search: ''
    }));

    renderWithRouter(<Login />);

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/organization name/i), { target: { value: 'TestOrg' } });
      fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'testuser' } });
      fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/protected-page');
    });
  });
});