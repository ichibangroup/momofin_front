import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddUserOrgAdmin from '../AddUserOrgAdmin';

// Test that the component renders correctly
test('renders Add User (Org Admin) form', () => {
  render(<AddUserOrgAdmin />);
  expect(screen.getByText('Add User (Org Admin)')).toBeInTheDocument();
  expect(screen.getByLabelText('Username:')).toBeInTheDocument();
  expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  expect(screen.getByLabelText('Email:')).toBeInTheDocument();
  expect(screen.getByLabelText('Position:')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
});

// Test that form inputs can change values
test('inputs accept values and handle changes', () => {
  render(<AddUserOrgAdmin />);

  // Simulate input for each field
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'orgUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'orgPass' } });
  fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'org@example.com' } });
  fireEvent.change(screen.getByLabelText('Position:'), { target: { value: 'Org Admin' } });

  // Check if the values have changed
  expect(screen.getByLabelText('Username:').value).toBe('orgUser');
  expect(screen.getByLabelText('Password:').value).toBe('orgPass');
  expect(screen.getByLabelText('Email:').value).toBe('org@example.com');
  expect(screen.getByLabelText('Position:').value).toBe('Org Admin');
});

// Test form submission and clearing inputs
test('submits form and clears inputs', () => {
  render(<AddUserOrgAdmin />);

  // Fill in the form
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'orgUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'orgPass' } });
  fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'org@example.com' } });
  fireEvent.change(screen.getByLabelText('Position:'), { target: { value: 'Org Admin' } });

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

  render(<AddUserOrgAdmin />);

  // Fill in the form
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'orgUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'orgPass' } });
  fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'org@example.com' } });
  fireEvent.change(screen.getByLabelText('Position:'), { target: { value: 'Org Admin' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

  // Check if the data was logged correctly
  expect(console.log).toHaveBeenCalledWith('Submitted user data:', {
    username: 'orgUser',
    password: 'orgPass',
    email: 'org@example.com',
    position: 'Org Admin',
  });
});