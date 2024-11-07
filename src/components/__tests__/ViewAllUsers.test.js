import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewUsers from '../ViewAllUsers'; // Ensure the path matches where your file is located
import api from '../../utils/api';
import { BrowserRouter as Router } from 'react-router-dom';

// Mocking FontAwesome icons if necessary
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <div></div>
}));

// Mocking api module
jest.mock('../../utils/api', () => ({
  get: jest.fn()
}));

// Helper component to wrap elements in Router for useNavigate to work
const Wrapper = ({ children }) => <Router>{children}</Router>;

describe('ViewUsers Component Tests', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'Galih Ibrahim Kurniawan',
      username: 'Sirered',
      organization: 'ICHIBAN GROUP',
      email: 'emailme@example.com',
    }
  ];

  beforeEach(() => {
    api.get.mockResolvedValue({ data: mockUsers });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders users after API call', async () => {
    render(<ViewUsers />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
      expect(screen.getByText('Sirered')).toBeInTheDocument();
      expect(screen.getByText('ICHIBAN GROUP')).toBeInTheDocument();
      expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
    });
  });

  test('displays loading state before users are fetched', () => {
    render(<ViewUsers />, { wrapper: Wrapper });
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test('displays error when fetching users fails', async () => {
    api.get.mockRejectedValue(new Error('Failed to fetch users'));

    render(<ViewUsers />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
    });
  });

  test('handles sorting users', async () => {
    render(<ViewUsers />, { wrapper: Wrapper });
    await waitFor(() => {
      const nameHeader = screen.getByText('Name').closest('th');
      // Simulate clicking to sort
      userEvent.click(nameHeader);
    });
  
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1); // Called once on initial load, once on sort
      expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
    });
  });  
  

  test('delete user functionality triggers modal', async () => {
    render(<ViewUsers />, { wrapper: Wrapper });
    await waitFor(() => {
      const deleteButton = screen.getAllByTitle('Remove User')[0];
      userEvent.click(deleteButton);
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });
  });

  // Further tests for edit and add functionality can be added here
});

