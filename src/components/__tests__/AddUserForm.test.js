import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import AddUserForm from '../AddUserForm';
import api from '../../utils/api';
import { sanitizeFormData, sanitizePlainText } from '../../utils/sanitizer';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock API and sanitization utilities
jest.mock('../../utils/api');
jest.mock('../../utils/sanitizer');

describe('AddUserForm Component', () => {
  let alertSpy;

  beforeEach(() => {
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {}); // Mock window.alert
  });

  afterEach(() => {
    alertSpy.mockRestore(); // Restore original alert function
  });

  beforeEach(() => {
    sanitizeFormData.mockImplementation((data) => data);
    sanitizePlainText.mockImplementation((text) => text);
  });

  it('renders form fields and title correctly', () => {
    render(<AddUserForm title="Register New User" />);
    
    expect(screen.getByText('Register New User')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Position')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Register User')).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    render(<AddUserForm title="Register New User" />);
    
    fireEvent.click(screen.getByText('Register User'));
    
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 10 characters')).toBeInTheDocument();
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByText('Position is required')).toBeInTheDocument();
  });

  it('displays error when password is too short', async () => {
    render(<AddUserForm title="Register New User" />);

    userEvent.type(screen.getByLabelText('Password'), 'short');

    fireEvent.click(screen.getByText('Register User'));

    expect(await screen.findByText('Password must be at least 10 characters')).toBeInTheDocument();
  });

  it('sanitizes input data on change', () => {
    render(<AddUserForm title="Register New User" />);

    userEvent.type(screen.getByLabelText('Name'), '   John Doe   ');
    expect(sanitizePlainText).toHaveBeenCalledWith('   John Doe   ');
  });

  it('sanitizes form data on submit', async () => {
    render(<AddUserForm title="Register New User" />);

    userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    userEvent.type(screen.getByLabelText('Username'), 'johndoe');
    userEvent.type(screen.getByLabelText('Password'), 'securepassword');
    userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    userEvent.type(screen.getByLabelText('Position'), 'Developer');

    fireEvent.click(screen.getByText('Register User'));

    await waitFor(() => expect(sanitizeFormData).toHaveBeenCalledWith({
      name: 'John Doe',
      username: 'johndoe',
      password: 'securepassword',
      email: 'john@example.com',
      position: 'Developer'
    }));
  });

  it('calls API on successful form submission', async () => {
    api.post.mockResolvedValue({ status: 200 });
    
    render(<AddUserForm title="Register New User" />);
  
    userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    userEvent.type(screen.getByLabelText('Username'), 'johndoe');
    userEvent.type(screen.getByLabelText('Password'), 'securepassword');
    userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    userEvent.type(screen.getByLabelText('Position'), 'Developer');
  
    fireEvent.click(screen.getByText('Register User'));
  
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'John Doe',
        username: 'johndoe',
        password: 'securepassword',
        email: 'john@example.com',
        position: 'Developer'
      });
    });
  
    // Wait for the alert to be called after the API response
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Registration successful!');
    });
  });

  it('displays an error message on API failure', async () => {
    api.post.mockRejectedValue(new Error('Registration failed'));

    render(
      <Router>
        <AddUserForm />
      </Router>
    );

    // Fill out and submit form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText('Position'), { target: { value: 'Developer' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'securepassword' } });
    fireEvent.click(screen.getByText('Register User'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Registration failed');
    });
  });

  it('clears specific field error when the field is changed', async () => {
    render(<AddUserForm title="Register New User" />);
    
    // First submit the form empty to generate errors
    fireEvent.click(screen.getByText('Register User'));
    
    // Verify the name error is present
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    
    // Type in the name field
    userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    
    // Verify the name error is cleared
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    
    // Verify other errors remain (testing that only the specific field error was cleared)
    expect(screen.getByText('Username is required')).toBeInTheDocument();
  });

  it('handles multiple error clearings correctly', async () => {
    render(<AddUserForm title="Register New User" />);
    
    // Submit empty form to generate errors
    fireEvent.click(screen.getByText('Register User'));
    
    // Wait for errors to appear
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    });
    
    // Type in name and email fields
    userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    
    // Verify both errors are cleared while others remain
    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      expect(screen.queryByText('Email is invalid')).not.toBeInTheDocument();
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 10 characters')).toBeInTheDocument();
    });
  });
});