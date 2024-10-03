import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import EditProfile from '../EditProfile';

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('EditProfile Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders EditProfile component', () => {
    render(<EditProfile />);
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Here, you can edit your profile information.')).toBeInTheDocument();
  });

  test('renders form fields', () => {
    render(<EditProfile />);
    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Old Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password:')).toBeInTheDocument();
  });

  test('renders buttons', () => {
    render(<EditProfile />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('handles back button click', () => {
    render(<EditProfile />);
    const backButton = screen.getByRole('button', { name: 'Back' });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });


  test('handles input changes', () => {
    render(<EditProfile />);
    const usernameInput = screen.getByLabelText('Username:');
    fireEvent.change(usernameInput, { target: { value: 'newusername' } });
    expect(usernameInput.value).toBe('newusername');

    const emailInput = screen.getByLabelText('Email:');
    fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });
    expect(emailInput.value).toBe('newemail@example.com');

    const oldPasswordInput = screen.getByLabelText('Old Password:');
    fireEvent.change(oldPasswordInput, { target: { value: 'oldpassword' } });
    expect(oldPasswordInput.value).toBe('oldpassword');

    const newPasswordInput = screen.getByLabelText('New Password:');
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
    expect(newPasswordInput.value).toBe('newpassword');
  });

  test('cancel button is present', () => {
    render(<EditProfile />);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();
    // Note: Add more assertions if you implement cancel functionality
  });
});