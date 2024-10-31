import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import EditUserOrgProfile from '../EditUserOrgProfile';
import api from '../../utils/api';

// Mock API calls
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

// Mock useParams to simulate route parameters
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('EditUserOrgProfile', () => {
  const mockUserData = {
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    position: 'Developer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ userId: 'testuser' }); // Mock userId as testuser
  });

  test('renders all form fields and submit button', async () => {
    api.get.mockResolvedValueOnce({ data: mockUserData });

    render(
        <Router>
          <EditUserOrgProfile />
        </Router>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading')).toHaveTextContent('Edit User Organisation Profile');
    });

    // Check if all fields are rendered with initial values
    ['username', 'email', 'name', 'position'].forEach(field => {
      expect(screen.getByLabelText(new RegExp(`^${field}:`, 'i'))).toBeInTheDocument();
    });

    // Check for submit button
    expect(screen.getByRole('button')).toHaveTextContent('Save Changes');
  });

  test('input fields have correct types', async () => {
    api.get.mockResolvedValueOnce({ data: mockUserData });

    render(
        <Router>
          <EditUserOrgProfile />
        </Router>
    );

    await waitFor(() => {
      for (const [field, value] of Object.entries(mockUserData)) {
        const input = screen.getByLabelText(new RegExp(`^${field}:`, 'i'));
        fireEvent.change(input, { target: { value: `new${value}` } });
        expect(input).toHaveValue(`new${value}`);
      }
    });
  });

  test('displays error message on submission failure', async () => {
    api.get.mockResolvedValueOnce({ data: mockUserData });
    api.put.mockRejectedValueOnce({ response: { data: { message: 'Update failed' } } });

    render(
        <Router>
          <EditUserOrgProfile />
        </Router>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });

    // Check for error message display
    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();
  });

  test('form submission calls API with correct data', async () => {
    api.get.mockResolvedValueOnce({ data: mockUserData });
    api.put.mockResolvedValueOnce({});

    render(
        <Router>
          <EditUserOrgProfile />
        </Router>
    );

    // Change form fields
    await waitFor(() => {
      for (const [field, value] of Object.entries(mockUserData)) {
        const input = screen.getByLabelText(new RegExp(`^${field}:`, 'i'));
        fireEvent.change(input, { target: { value: `new${value}` } });
      }
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    // Ensure API call is made with updated data
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/user/profile/testuser', {
        username: 'newtestuser',
        email: 'newtest@example.com',
        name: 'newTest User',
        position: 'newDeveloper',
      });
    });
  });
});
