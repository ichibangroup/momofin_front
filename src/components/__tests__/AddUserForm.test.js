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
    password: 'password123',
    email: 'john@example.com',
    position: 'Developer'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset window.alert
    global.alert = jest.fn();
  });

  it('renders form with correct title and all input fields', () => {
    render(<AddUserForm title={mockTitle} />);

    // Check title
    expect(screen.getByText(mockTitle)).toBeInTheDocument();

    // Check all form inputs are present
    expect(screen.getByLabelText('Name:', { exact: true })).toBeInTheDocument();
    expect(screen.getByLabelText(/username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position:/i)).toBeInTheDocument();

    // Check submit button
    expect(screen.getByText(/register user/i)).toBeInTheDocument();
  });

  it('updates form fields when user types', async () => {
    render(<AddUserForm title={mockTitle} />);

    const nameInput = screen.getByLabelText('Name:', { exact: true });
    const usernameInput = screen.getByLabelText(/username:/i);
    const passwordInput = screen.getByLabelText(/password:/i);
    const emailInput = screen.getByLabelText(/email:/i);
    const positionInput = screen.getByLabelText(/position:/i);

    // Type in each field
    await userEvent.type(nameInput, mockFormData.name);
    await userEvent.type(usernameInput, mockFormData.username);
    await userEvent.type(passwordInput, mockFormData.password);
    await userEvent.type(emailInput, mockFormData.email);
    await userEvent.type(positionInput, mockFormData.position);

    // Check if values are updated
    expect(nameInput).toHaveValue(mockFormData.name);
    expect(usernameInput).toHaveValue(mockFormData.username);
    expect(passwordInput).toHaveValue(mockFormData.password);
    expect(emailInput).toHaveValue(mockFormData.email);
    expect(positionInput).toHaveValue(mockFormData.position);
  });

  it('submits form successfully if valid', async () => {
    // Mock successful API response
    api.post.mockResolvedValueOnce({ status: 200, data: { message: 'Success' } });

    render(<AddUserForm title={mockTitle} />);

    // Fill out the form
    await userEvent.type(screen.getByLabelText('Name:', { exact: true }), mockFormData.name);
    await userEvent.type(screen.getByLabelText(/username:/i), mockFormData.username);
    await userEvent.type(screen.getByLabelText(/password:/i), mockFormData.password);
    await userEvent.type(screen.getByLabelText(/email:/i), mockFormData.email);
    await userEvent.type(screen.getByLabelText(/position:/i), mockFormData.position);

    // Submit the form
    await userEvent.click(screen.getByText(/register user/i));

    // Check if API was called with correct data
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

  it('does not submit form when required fields are missing', async () => {
    render(<AddUserForm title={mockTitle} />);

    // Submit the form without filling the fields
    await userEvent.click(screen.getByText(/register user/i));

    // Expect HTML5 validation error for required fields
    expect(screen.getByLabelText('Name:', { exact: true })).toBeInvalid();
    expect(screen.getByLabelText(/username:/i)).toBeInvalid();
    expect(screen.getByLabelText(/password:/i)).toBeInvalid();
    expect(screen.getByLabelText(/email:/i)).toBeInvalid();
    expect(screen.getByLabelText(/position:/i)).toBeInvalid();

    // API should not be called
    expect(api.post).not.toHaveBeenCalled();
  });

  it('handles API error during submission', async () => {
    // Mock API error
    const errorMessage = 'Registration failed';
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

    // Submit the form
    await userEvent.click(screen.getByText(/register user/i));

    // Check if error alert was shown
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(errorMessage);
    });

    // Check if form data remains (not cleared)
    expect(screen.getByLabelText('Name:', { exact: true })).toHaveValue(mockFormData.name);
    expect(screen.getByLabelText(/username:/i)).toHaveValue(mockFormData.username);
    expect(screen.getByLabelText(/password:/i)).toHaveValue(mockFormData.password);
    expect(screen.getByLabelText(/email:/i)).toHaveValue(mockFormData.email);
    expect(screen.getByLabelText(/position:/i)).toHaveValue(mockFormData.position);
  });

  it('validates email format', async () => {
    render(<AddUserForm title={mockTitle} />);

    const emailInput = screen.getByLabelText(/email:/i);

    // Type invalid email
    await userEvent.type(emailInput, 'invalid-email');

    // Try to submit the form
    await userEvent.click(screen.getByText(/register user/i));

    // Check if HTML5 validation catches invalid email
    expect(emailInput).toBeInvalid();

    // API should not be called
    expect(api.post).not.toHaveBeenCalled();
  });
});
