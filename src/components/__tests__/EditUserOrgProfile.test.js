import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditUserOrgProfile from '../EditUserOrgProfile';

// Mock console.log to test form submission
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('EditUserOrgProfile', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console.log after all tests
    mockConsoleLog.mockRestore();
  });

  test('renders all form fields and submit button', () => {
    render(<EditUserOrgProfile />);

    // Check for heading
    expect(screen.getByRole('heading')).toHaveTextContent('Edit User Organisation Profile');

    // Check for all input fields
    const fields = ['username', 'email', 'oldPassword', 'newPassword', 'name', 'position'];
    fields.forEach(field => {
      expect(screen.getByLabelText(new RegExp(`^${field}:`, 'i'))).toBeInTheDocument();
    });

    // Check for submit button
    expect(screen.getByRole('button')).toHaveTextContent('Save Changes');
  });

  test('input fields have correct types', () => {
    render(<EditUserOrgProfile />);

    // Password fields should be type="password"
    expect(screen.getByLabelText(/^oldPassword:/i)).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText(/^newPassword:/i)).toHaveAttribute('type', 'password');

    // Other fields should be type="text"
    expect(screen.getByLabelText(/^username:/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/^email:/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/^name:/i)).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/^position:/i)).toHaveAttribute('type', 'text');
  });

  test('handles input changes correctly', () => {
    render(<EditUserOrgProfile />);

    // Test data for each field
    const testData = {
      username: 'testuser',
      email: 'test@example.com',
      oldPassword: 'oldpass123',
      newPassword: 'newpass123',
      name: 'Test User',
      position: 'Developer'
    };

    // Type into each input field and verify value
    for (const [field, value] of Object.entries(testData)) {
      const input = screen.getByLabelText(new RegExp(`^${field}:`, 'i'));
      fireEvent.change(input, { target: { value } });
      expect(input).toHaveValue(value);
    }
  });

  test('form submission prevents default and logs form data', () => {
    render(<EditUserOrgProfile />);

    // Fill out the form
    const testData = {
      username: 'testuser',
      email: 'test@example.com',
      oldPassword: 'oldpass123',
      newPassword: 'newpass123',
      name: 'Test User',
      position: 'Developer'
    };

    for (const [field, value] of Object.entries(testData)) {
      const input = screen.getByLabelText(new RegExp(`^${field}:`, 'i'));
      fireEvent.change(input, { target: { value } });
    }

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    // Verify console.log was called with the form data
    expect(mockConsoleLog).toHaveBeenCalledWith('Form submitted:', testData);
  });

  test('displays error message on submission failure', async () => {
    render(<EditUserOrgProfile />);
    const testData = {
      username: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      position: 'Developer'
    };

    for (const [field, value] of Object.entries(testData)) {
      const input = screen.getByLabelText(new RegExp('^${field}:', 'i'));
      fireEvent.change(input, { target: { value } });
    }

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();
  });

  test('form maintains empty initial state', () => {
    render(<EditUserOrgProfile />);

    // Check that all fields are initially empty
    const fields = ['username', 'email', 'oldPassword', 'newPassword', 'name', 'position'];
    fields.forEach(field => {
      const input = screen.getByLabelText(new RegExp(`^${field}:`, 'i'));
      expect(input).toHaveValue('');
    });
  });

  test('handles multiple input changes in sequence', () => {
    render(<EditUserOrgProfile />);

    const usernameInput = screen.getByLabelText(/^username:/i);
    const emailInput = screen.getByLabelText(/^email:/i);

    // Change username, then email, then username again
    fireEvent.change(usernameInput, { target: { value: 'user1' } });
    expect(usernameInput).toHaveValue('user1');

    fireEvent.change(emailInput, { target: { value: 'user1@test.com' } });
    expect(emailInput).toHaveValue('user1@test.com');

    fireEvent.change(usernameInput, { target: { value: 'user2' } });
    expect(usernameInput).toHaveValue('user2');
    expect(emailInput).toHaveValue('user1@test.com'); // Email should remain unchanged
  });
});