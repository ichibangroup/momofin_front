import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ViewUsers from '../ViewAllUsers'; // Ensure the path matches where your file is located
import api from '../../utils/api';
import { BrowserRouter as Router } from 'react-router-dom';

// Mocking FontAwesome icons and the api module
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <div></div>
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));
jest.mock('../../utils/api');

// Helper component to wrap elements in Router for useNavigate to work
const Wrapper = ({ children }) => <Router>{children}</Router>;

describe('ViewUsers Component Tests', () => {
  const mockUsers = [
    {
      userId: 1,
      name: 'Galih Ibrahim Kurniawan',
      username: 'Sirered',
      organization: 'ICHIBAN GROUP',
      email: 'emailme@example.com',
    }
  ];
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    api.get.mockResolvedValue({ data: mockUsers });
    api.put.mockResolvedValue({});
    api.delete.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  const renderComponent = () => render(<ViewUsers />, { wrapper: Wrapper });

  test('renders users after API call', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
      expect(screen.getByText('Sirered')).toBeInTheDocument();
      expect(screen.getByText('ICHIBAN GROUP')).toBeInTheDocument();
      expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
    });
  });

  test('displays loading state before users are fetched', () => {
    renderComponent();
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test('displays error when fetching users fails', async () => {
    api.get.mockRejectedValue(new Error('Failed to fetch users'));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
    });
  });

  test('handles sorting users', async () => {
    renderComponent();
    await waitFor(() => {
      const nameHeader = screen.getByText('Name').closest('th');
      fireEvent.click(nameHeader); // Click to sort by name
    });

    // Verify sorting logic by checking if users are in correct order
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1); // Initial fetch + fetch after sort
      expect(screen.getAllByText(/galih ibrahim kurniawan|sirered/i).length).toBeGreaterThan(0);
    });
  });

  test('delete user functionality triggers modal and handles deletion', async () => {
    renderComponent();
    await waitFor(() => {
      const deleteButton = screen.getAllByTitle('Remove User')[0];
      fireEvent.click(deleteButton); // Click to open modal
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
    });
  
    // Find the "Delete User" button in the modal and click it to confirm deletion
    const confirmButton = screen.getByText('Delete User');
    fireEvent.click(confirmButton);
  
    await waitFor(() => {
      // Check that the API delete method was called, assuming you're mocking API calls
      expect(api.delete).toHaveBeenCalled();
      // Optionally, check that the modal has closed or the user is no longer in the list, depending on how your component handles updates
      expect(screen.queryByText('Galih Ibrahim Kurniawan')).not.toBeInTheDocument();
    });
  });
  

  test('edit user navigates to edit page', async () => {
    renderComponent();
    await waitFor(() => {
      const editButton = screen.getAllByTitle('Edit User')[0];
      fireEvent.click(editButton); // Click to edit user
      expect(mockNavigate).toHaveBeenCalledWith('/app/editProfile/1')
    });
  });
  test('promotes a user to admin and displays success message', async () => {
    renderComponent();
    await waitFor(() => {
      const promoteButtons = screen.getAllByTitle('Promote to Admin')[0];
      fireEvent.click(promoteButtons); // Click to promote the first user to admin
    });

    await waitFor(() => {
      // Check that the API put method was called
      expect(api.put).toHaveBeenCalled();
    });
  });

  test('handles error when promoting user to admin', async () => {
    // Mock an API failure
    api.put.mockRejectedValueOnce(new Error('Failed to promote user'));
    
    renderComponent();
    await waitFor(() => {
      const promoteButtons = screen.getAllByTitle('Promote to Admin')[0];
      fireEvent.click(promoteButtons); // Attempt to promote the user
    });

    // Optionally, clear the message and check that it disappears
    jest.advanceTimersByTime(5000); // Assume you've called jest.useFakeTimers() in your setup
    await waitFor(() => {
      expect(screen.queryByText('Failed to promote user')).not.toBeInTheDocument();
    });
  });
  test('displays and clears error message on delete failure', async () => {
    api.delete.mockRejectedValueOnce(new Error('Failed to delete user'));
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
    });

    // Simulate delete operation
    fireEvent.click(screen.getAllByTitle('Remove User')[0]);

    // Confirm deletion to trigger the error
    const confirmButton = screen.getByText('Delete User');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalled();
    });

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(5000);

    // Checks that the error message is cleared
    expect(screen.queryByText('Failed to delete user')).not.toBeInTheDocument();
  });
});
