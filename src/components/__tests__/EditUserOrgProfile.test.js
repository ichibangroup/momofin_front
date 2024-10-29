import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditUserOrgProfile from '../EditUserOrgProfile';

describe('EditUserOrgProfile', () => {
  test('renders all input fields correctly', () => {
    render(<EditUserOrgProfile />);

    // Check that all input fields are rendered
    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Old Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position:/i)).toBeInTheDocument();
  });

  test('updates state when inputs change', () => {
    render(<EditUserOrgProfile />);

    // Select input fields
    const usernameInput = screen.getByLabelText(/Username:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const nameInput = screen.getByLabelText(/Name:/i);
    const positionInput = screen.getByLabelText(/Position:/i);

    // Simulate typing in input fields
    fireEvent.change(usernameInput, { target: { value: 'newUsername' } });
    fireEvent.change(emailInput, { target: { value: 'newEmail@example.com' } });
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(positionInput, { target: { value: 'Developer' } });

    // Check if the input values were updated
    expect(usernameInput.value).toBe('newUsername');
    expect(emailInput.value).toBe('newEmail@example.com');
    expect(nameInput.value).toBe('John Doe');
    expect(positionInput.value).toBe('Developer');
  });

  test('logs form submission with user data', () => {
    render(<EditUserOrgProfile />);

    // Select input fields and form submit button
    const usernameInput = screen.getByLabelText(/Username:/i);
    const submitButton = screen.getByText(/Save Changes/i);

    // Simulate typing and form submission
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.click(submitButton);

    // Test that the form data is logged (you can check the console)
    expect(console.log).toHaveBeenCalledWith('Form submitted:', {
      username: 'testUser',
      email: '',
      oldPassword: '',
      newPassword: '',
      name: '',
      position: '',
    });
  });
});
