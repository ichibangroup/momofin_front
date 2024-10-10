import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddUserMomofinAdmin from '../AddUserMomofinAdmin';

// Test that the component renders correctly
test('renders Add User (Momofin Admin) form', () => {
  render(<AddUserMomofinAdmin />);
  expect(screen.getByText('Add User (Momofin Admin)')).toBeInTheDocument();
  expect(screen.getByLabelText('Username:')).toBeInTheDocument();
  expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  expect(screen.getByLabelText('Email:')).toBeInTheDocument();
  expect(screen.getByLabelText('Position:')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
});

// Test that form inputs can change values
test('inputs accept values and handle changes', () => {
  render(<AddUserMomofinAdmin />);

  // Simulate input for each field
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'testPass' } });
  fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Position:'), { target: { value: 'Admin' } });

  // Check if the values have changed
  expect(screen.getByLabelText('Username:').value).toBe('testUser');
  expect(screen.getByLabelText('Password:').value).toBe('testPass');
  expect(screen.getByLabelText('Email:').value).toBe('test@example.com');
  expect(screen.getByLabelText('Position:').value).toBe('Admin');
});

// Test form submission and clearing inputs
test('submits form and clears inputs', () => {
  render(<AddUserMomofinAdmin />);

  // Fill in the form
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'testPass' } });
  fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Position:'), { target: { value: 'Admin' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

  // Check that the form inputs are cleared after submission
  expect(screen.getByLabelText('Username:').value).toBe('');
  expect(screen.getByLabelText('Password:').value).toBe('');
  expect(screen.getByLabelText('Email:').value).toBe('');
  expect(screen.getByLabelText('Position:').value).toBe('');
});

// Test form submission logic
test('logs submitted data correctly', () => {
  console.log = jest.fn(); // Mock console.log

  render(<AddUserMomofinAdmin />);

  // Fill in the form
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'testPass' } });
  fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Position:'), { target: { value: 'Admin' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

  // Check if the data was logged correctly
  expect(console.log).toHaveBeenCalledWith('Submitted user data:', {
    username: 'testUser',
    password: 'testPass',
    email: 'test@example.com',
    position: 'Admin',
  });
});
