import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {MemoryRouter} from 'react-router-dom';
import AddOrganisation from '../AddNewOrganisation';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

jest.mock('../../utils/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// Test that the component renders correctly
test('renders Add Organisation form', () => {
  renderWithRouter(<AddOrganisation />);
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

// Test form submission and clearing inputs
test('submits form and clears inputs', async () => {
  useNavigate.mockReturnValue(mockNavigate);

  api.post.mockResolvedValueOnce({status: 200});

  renderWithRouter(<AddOrganisation />);
  fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
  fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
  fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
  fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});
  fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
  fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});

  fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));

  await waitFor(() => {
    expect(screen.getByLabelText('Organisation Name:').value).toBe('');
    expect(screen.getByLabelText('Industry:').value).toBe('');
    expect(screen.getByLabelText('Address:').value).toBe('');
    expect(screen.getByLabelText('Description:').value).toBe('');
    expect(screen.getByLabelText('Username:').value).toBe('');
    expect(screen.getByLabelText('Password:').value).toBe('');
  });

  expect(mockNavigate).toHaveBeenCalledWith('/app/viewOrg');
});

test('displays error message on API error', async () => {
  api.post.mockRejectedValueOnce({response: {data: {message: 'Error creating organization'}}});

  renderWithRouter(<AddOrganisation />);
  fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
  fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
  fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
  fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});
  fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
  fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});

  fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

  expect(await screen.findByText('Error creating organization')).toBeInTheDocument();
});

test('disables the submit button while submitting', async () => {
  api.post.mockResolvedValueOnce({status: 200});

  renderWithRouter(<AddOrganisation />);
  fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
  fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
  fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
  fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});
  fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
  fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});

  const submitButton = screen.getByRole('button');
  fireEvent.click(submitButton);

  expect(submitButton).toBeDisabled();

  await waitFor(() => expect(submitButton).toHaveTextContent('Submitting...'));

  await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
});

test('clears error messages after submission', async () => {
  api.post = jest.fn().mockResolvedValue({status: 200});

  renderWithRouter(<AddOrganisation />);
  fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
  fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
  fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
  fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});
  fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
  fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});

  api.post.mockRejectedValueOnce({response: {data: {message: 'Error creating organization'}}});

  fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

  expect(await screen.findByText('Error creating organization')).toBeInTheDocument();

  api.post.mockResolvedValueOnce({status: 200});
  fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

  expect(screen.queryByText('Error creating organization')).not.toBeInTheDocument();
});

test('does not allow form submission with missing required fields', async () => {
  renderWithRouter(<AddOrganisation />);

  // Click submit with no input values
  fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

  // Ensure all required fields are empty
  expect(screen.getByLabelText('Organisation Name:').value).toBe('');
  expect(screen.getByLabelText('Industry:').value).toBe('');
  expect(screen.getByLabelText('Address:').value).toBe('');
  expect(screen.getByLabelText('Description:').value).toBe('');
  expect(screen.getByLabelText('Username:').value).toBe('');
  expect(screen.getByLabelText('Password:').value).toBe('');
});
