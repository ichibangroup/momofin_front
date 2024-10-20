import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import AddUserForm from '../AddUserForm';
import api from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api');

describe('AddUserForm', () => {
  const mockTitle = 'Add New User';
  const mockFormData = {
    name: 'John Doe',
    username: 'johndoe',
    password: 'password123456', // Updated to meet 10 character requirement
    email: 'john@example.com',
    position: 'Developer'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  it('renders form with correct title and all input fields', () => {
    render(<AddUserForm title={mockTitle} />);

    expect(screen.getByText(mockTitle)).toBeInTheDocument();

    // Check all form inputs are present
    expect(screen.getByLabelText('Name:', { exact: true })).toBeInTheDocument();
    expect(screen.getByLabelText(/username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position:/i)).toBeInTheDocument();
    expect(screen.getByText(/register user/i)).toBeInTheDocument();
  });

  it('updates form fields when user types', async () => {
    render(<AddUserForm title={mockTitle} />);

    const nameInput = screen.getByLabelText('Name:', { exact: true });
    const usernameInput = screen.getByLabelText(/username:/i);
    const passwordInput = screen.getByLabelText(/password:/i);
    const emailInput = screen.getByLabelText(/email:/i);
    const positionInput = screen.getByLabelText(/position:/i);

    await userEvent.type(nameInput, mockFormData.name);
    await userEvent.type(usernameInput, mockFormData.username);
    await userEvent.type(passwordInput, mockFormData.password);
    await userEvent.type(emailInput, mockFormData.email);
    await userEvent.type(positionInput, mockFormData.position);

    expect(nameInput).toHaveValue(mockFormData.name);
    expect(usernameInput).toHaveValue(mockFormData.username);
    expect(passwordInput).toHaveValue(mockFormData.password);
    expect(emailInput).toHaveValue(mockFormData.email);
    expect(positionInput).toHaveValue(mockFormData.position);
  });

  it('displays validation errors for empty fields', async () => {
    render(<AddUserForm title={mockTitle} />);

    // Submit empty form
    await userEvent.click(screen.getByText(/register user/i));

    // Check for error messages
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 10 characters')).toBeInTheDocument();
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByText('Position is required')).toBeInTheDocument();

    // API should not be called
    expect(api.post).not.toHaveBeenCalled();
  });

  it('clears error message when user starts typing', async () => {
    render(<AddUserForm title={mockTitle} />);

    // Submit empty form to trigger errors
    await userEvent.click(screen.getByText(/register user/i));
    expect(screen.getByText('Name is required')).toBeInTheDocument();

    // Type in name field
    await userEvent.type(screen.getByLabelText('Name:', { exact: true }), 'J');

    // Error message should be gone
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  it('submits form successfully when all fields are valid', async () => {
    api.post.mockResolvedValueOnce({ status: 200, data: { message: 'Success' } });

    render(<AddUserForm title={mockTitle} />);

    // Fill out the form
    await userEvent.type(screen.getByLabelText('Name:', { exact: true }), mockFormData.name);
    await userEvent.type(screen.getByLabelText(/username:/i), mockFormData.username);
    await userEvent.type(screen.getByLabelText(/password:/i), mockFormData.password);
    await userEvent.type(screen.getByLabelText(/email:/i), mockFormData.email);
    await userEvent.type(screen.getByLabelText(/position:/i), mockFormData.position);

    await userEvent.click(screen.getByText(/register user/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', mockFormData);
      expect(global.alert).toHaveBeenCalledWith('Registration successful!');

      // Check if form was reset
      expect(screen.getByLabelText('Name:', { exact: true })).toHaveValue('');
      expect(screen.getByLabelText(/username:/i)).toHaveValue('');
      expect(screen.getByLabelText(/password:/i)).toHaveValue('');
      expect(screen.getByLabelText(/email:/i)).toHaveValue('');
      expect(screen.getByLabelText(/position:/i)).toHaveValue('');
    });
  });

  it('submits form successfully but not status 200', async () => {
    api.post.mockResolvedValueOnce({ status: 500, data: { message: 'Success' } });

    render(<AddUserForm title={mockTitle} />);

    // Fill out the form
    await userEvent.type(screen.getByLabelText('Name:', { exact: true }), mockFormData.name);
    await userEvent.type(screen.getByLabelText(/username:/i), mockFormData.username);
    await userEvent.type(screen.getByLabelText(/password:/i), mockFormData.password);
    await userEvent.type(screen.getByLabelText(/email:/i), mockFormData.email);
    await userEvent.type(screen.getByLabelText(/position:/i), mockFormData.position);

    await userEvent.click(screen.getByText(/register user/i));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', mockFormData);
      expect(global.alert).not.toHaveBeenCalled();

      // Check if form was reset
      expect(screen.getByLabelText('Name:', { exact: true })).toHaveValue(mockFormData.name);
      expect(screen.getByLabelText(/username:/i)).toHaveValue(mockFormData.username);
      expect(screen.getByLabelText(/password:/i)).toHaveValue(mockFormData.password);
      expect(screen.getByLabelText(/email:/i)).toHaveValue(mockFormData.email);
      expect(screen.getByLabelText(/position:/i)).toHaveValue(mockFormData.position);
    });
  });

  it('displays validation error for short password', async () => {
    render(<AddUserForm title={mockTitle} />);

    await userEvent.type(screen.getByLabelText(/password:/i), 'short');
    await userEvent.click(screen.getByText(/register user/i));

    expect(screen.getByText('Password must be at least 10 characters')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email', async () => {
    render(<AddUserForm title={mockTitle} />);

    await userEvent.type(screen.getByLabelText(/email:/i), 'invalid-email');
    await userEvent.click(screen.getByText(/register user/i));

    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('handles API error during submission', async () => {
    const errorMessage = 'error message';
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    render(<AddUserForm title={mockTitle} />);

    // Fill out the form
    await userEvent.type(screen.getByLabelText('Name:', { exact: true }), mockFormData.name);
    await userEvent.type(screen.getByLabelText(/username:/i), mockFormData.username);
    await userEvent.type(screen.getByLabelText(/password:/i), mockFormData.password);
    await userEvent.type(screen.getByLabelText(/email:/i), mockFormData.email);
    await userEvent.type(screen.getByLabelText(/position:/i), mockFormData.position);

    await userEvent.click(screen.getByText(/register user/i));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(errorMessage);

      // Form data should remain
      expect(screen.getByLabelText('Name:', { exact: true })).toHaveValue(mockFormData.name);
      expect(screen.getByLabelText(/username:/i)).toHaveValue(mockFormData.username);
      expect(screen.getByLabelText(/password:/i)).toHaveValue(mockFormData.password);
      expect(screen.getByLabelText(/email:/i)).toHaveValue(mockFormData.email);
      expect(screen.getByLabelText(/position:/i)).toHaveValue(mockFormData.position);
    });
  });

  it('handles API error with no message', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: {
        }
      }
    });

    render(<AddUserForm title={mockTitle} />);

    // Fill out the form
    await userEvent.type(screen.getByLabelText('Name:', { exact: true }), mockFormData.name);
    await userEvent.type(screen.getByLabelText(/username:/i), mockFormData.username);
    await userEvent.type(screen.getByLabelText(/password:/i), mockFormData.password);
    await userEvent.type(screen.getByLabelText(/email:/i), mockFormData.email);
    await userEvent.type(screen.getByLabelText(/position:/i), mockFormData.position);

    await userEvent.click(screen.getByText(/register user/i));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Registration failed');

      // Form data should remain
      expect(screen.getByLabelText('Name:', { exact: true })).toHaveValue(mockFormData.name);
      expect(screen.getByLabelText(/username:/i)).toHaveValue(mockFormData.username);
      expect(screen.getByLabelText(/password:/i)).toHaveValue(mockFormData.password);
      expect(screen.getByLabelText(/email:/i)).toHaveValue(mockFormData.email);
      expect(screen.getByLabelText(/position:/i)).toHaveValue(mockFormData.position);
    });
  });
});