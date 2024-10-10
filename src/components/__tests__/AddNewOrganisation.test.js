import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddOrganisation from '../AddNewOrganisation';

// Test that the component renders correctly
test('renders Add Organisation form', () => {
  render(<AddOrganisation />);
  expect(screen.getByRole('heading', { name: 'Add Organisation' })).toBeInTheDocument();
  expect(screen.getByLabelText('Organisation Name:')).toBeInTheDocument();
  expect(screen.getByLabelText('Industry:')).toBeInTheDocument();
  expect(screen.getByLabelText('Address:')).toBeInTheDocument();
  expect(screen.getByLabelText('Description:')).toBeInTheDocument();
  expect(screen.getByText('Admin User Details')).toBeInTheDocument();
  expect(screen.getByLabelText('Username:')).toBeInTheDocument();
  expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add Organisation' })).toBeInTheDocument();
});

// Test that form inputs can change values
test('inputs accept values and handle changes', () => {
  render(<AddOrganisation />);

  // Simulate input for each field
  fireEvent.change(screen.getByLabelText('Organisation Name:'), { target: { value: 'TestOrg' } });
  fireEvent.change(screen.getByLabelText('Industry:'), { target: { value: 'Technology' } });
  fireEvent.change(screen.getByLabelText('Address:'), { target: { value: '123 Main St' } });
  fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'An example organisation' } });
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'adminUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'adminPass' } });

  // Check if the values have changed
  expect(screen.getByLabelText('Organisation Name:').value).toBe('TestOrg');
  expect(screen.getByLabelText('Industry:').value).toBe('Technology');
  expect(screen.getByLabelText('Address:').value).toBe('123 Main St');
  expect(screen.getByLabelText('Description:').value).toBe('An example organisation');
  expect(screen.getByLabelText('Username:').value).toBe('adminUser');
  expect(screen.getByLabelText('Password:').value).toBe('adminPass');
});

// Test form submission and clearing inputs
test('submits form and clears inputs', () => {
  render(<AddOrganisation />);

  // Fill in the form
  fireEvent.change(screen.getByLabelText('Organisation Name:'), { target: { value: 'TestOrg' } });
  fireEvent.change(screen.getByLabelText('Industry:'), { target: { value: 'Technology' } });
  fireEvent.change(screen.getByLabelText('Address:'), { target: { value: '123 Main St' } });
  fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'An example organisation' } });
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'adminUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'adminPass' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: 'Add Organisation' }));

  // Check that the form inputs are cleared after submission
  expect(screen.getByLabelText('Organisation Name:').value).toBe('');
  expect(screen.getByLabelText('Industry:').value).toBe('');
  expect(screen.getByLabelText('Address:').value).toBe('');
  expect(screen.getByLabelText('Description:').value).toBe('');
  expect(screen.getByLabelText('Username:').value).toBe('');
  expect(screen.getByLabelText('Password:').value).toBe('');
});

// Test form submission logic
test('logs submitted data correctly', () => {
  console.log = jest.fn(); // Mock console.log

  render(<AddOrganisation />);

  // Fill in the form
  fireEvent.change(screen.getByLabelText('Organisation Name:'), { target: { value: 'TestOrg' } });
  fireEvent.change(screen.getByLabelText('Industry:'), { target: { value: 'Technology' } });
  fireEvent.change(screen.getByLabelText('Address:'), { target: { value: '123 Main St' } });
  fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'An example organisation' } });
  fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'adminUser' } });
  fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'adminPass' } });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: 'Add Organisation' }));

  // Check if the data was logged correctly
  expect(console.log).toHaveBeenCalledWith('Submitted organization and admin data:', { // Note the word "organization"
    name: 'TestOrg',
    industry: 'Technology',
    address: '123 Main St',
    description: 'An example organisation',
    username: 'adminUser',
    password: 'adminPass',
  });
});
