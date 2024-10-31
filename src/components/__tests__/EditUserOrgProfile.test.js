import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import EditUserOrgProfile from '../EditUserOrgProfile';
import api from '../../utils/api';

jest.mock('../../utils/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

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
    useParams.mockReturnValue({ userId: 'testuser' });
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

  test('displays error message on fetching user data failure', async () => {
    api.get.mockRejectedValueOnce(new Error('Fetch failed'));

    render(
        <Router>
          <EditUserOrgProfile />
        </Router>
    );

    await waitFor(() => expect(screen.getByText(/loading/i)).toBeInTheDocument());

    expect(await screen.findByText(/failed to fetch user data/i)).toBeInTheDocument();
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

    await waitFor(() => {
      for (const [field, value] of Object.entries(mockUserData)) {
        const input = screen.getByLabelText(new RegExp(`^${field}:`, 'i'));
        fireEvent.change(input, { target: { value: `new${value}` } });
      }
    });

    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/user/profile/testuser', {
        username: 'newtestuser',
        email: 'newtest@example.com',
        name: 'newTest User',
        position: 'newDeveloper',
      });
    });
  });

  test('error message can be retried', async () => {
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

    expect(await screen.findByText(/update failed/i)).toBeInTheDocument();

    api.put.mockResolvedValueOnce({});
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalled();
    });
  });
});
