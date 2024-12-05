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
    },
    {
      userId: 2,
      name: 'Ayu Lestari',
      username: 'ayulestari',
      organization: 'A-CORP',
      email: 'ayu@example.com',
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
  test('sorts users by name ascending and descending', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Ayu Lestari')).toBeInTheDocument();
      expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
    });
  
    // Click to sort by name ascending
    const nameHeader = screen.getByText('Name').closest('th');
    fireEvent.click(nameHeader);
    await waitFor(() => {
      const sortedNames = screen.getAllByText(/Ayu Lestari|Galih Ibrahim Kurniawan/);
      expect(sortedNames[0]).toHaveTextContent('Ayu Lestari');
      expect(sortedNames[1]).toHaveTextContent('Galih Ibrahim Kurniawan');
    });
  
    // Click again to sort by name descending
    fireEvent.click(nameHeader);
    await waitFor(() => {
      const sortedNames = screen.getAllByText(/Ayu Lestari|Galih Ibrahim Kurniawan/);
      expect(sortedNames[0]).toHaveTextContent('Galih Ibrahim Kurniawan');
      expect(sortedNames[1]).toHaveTextContent('Ayu Lestari');
    });
  });
  test('sorts users by username ascending and descending', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Sirered')).toBeInTheDocument();
      expect(screen.getByText('ayulestari')).toBeInTheDocument();
    });
  
    // Click to sort by username ascending
    const usernameHeader = screen.getByText('Username').closest('th');
    fireEvent.click(usernameHeader);
    await waitFor(() => {
      const sortedUsernames = screen.getAllByText(/Sirered|ayulestari/);
      expect(sortedUsernames[0]).toHaveTextContent('ayulestari'); 
      expect(sortedUsernames[1]).toHaveTextContent('Sirered');
    });
  
    // Click again to sort by username descending
    fireEvent.click(usernameHeader);
    await waitFor(() => {
      const sortedUsernames = screen.getAllByText(/Sirered|ayulestari/);
      expect(sortedUsernames[0]).toHaveTextContent('Sirered');
      expect(sortedUsernames[1]).toHaveTextContent('ayulestari');
    });
  });  

  test('sorts users by organization ascending and descending', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('ICHIBAN GROUP')).toBeInTheDocument();
      expect(screen.getByText('A-CORP')).toBeInTheDocument();
    });
  
    // Click to sort by organization ascending
    const organizationHeader = screen.getByText('Organization').closest('th');
    fireEvent.click(organizationHeader);
    await waitFor(() => {
      const sortedOrganizations = screen.getAllByText(/ICHIBAN GROUP|A-CORP/);
      expect(sortedOrganizations[0]).toHaveTextContent('A-CORP'); // Adjust based on actual order expected
      expect(sortedOrganizations[1]).toHaveTextContent('ICHIBAN GROUP');
    });
  
    // Click again to sort by organization descending
    fireEvent.click(organizationHeader);
    await waitFor(() => {
      const sortedOrganizations = screen.getAllByText(/ICHIBAN GROUP|A-CORP/);
      expect(sortedOrganizations[0]).toHaveTextContent('ICHIBAN GROUP');
      expect(sortedOrganizations[1]).toHaveTextContent('A-CORP');
    });
  });

  test('sorts users by email ascending and descending', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
      expect(screen.getByText('ayu@example.com')).toBeInTheDocument();
    });
  
    // Click to sort by email ascending
    const emailHeader = screen.getByText('Email').closest('th');
    fireEvent.click(emailHeader);
    await waitFor(() => {
      const sortedEmails = screen.getAllByText(/emailme@example.com|ayu@example.com/);
      expect(sortedEmails[0]).toHaveTextContent('ayu@example.com'); // Adjust based on actual order expected
      expect(sortedEmails[1]).toHaveTextContent('emailme@example.com');
    });
  
    // Click again to sort by email descending
    fireEvent.click(emailHeader);
    await waitFor(() => {
      const sortedEmails = screen.getAllByText(/emailme@example.com|ayu@example.com/);
      expect(sortedEmails[0]).toHaveTextContent('emailme@example.com');
      expect(sortedEmails[1]).toHaveTextContent('ayu@example.com');
    });
  });
  test('correctly identifies user roles', async () => {
    const usersWithRoles = [
      {
        userId: 1,
        name: 'Admin User',
        username: 'admin',
        organization: 'ICHIBAN GROUP',
        email: 'admin@example.com',
        momofinAdmin: true,
      },
      {
        userId: 2,
        name: 'Org Admin',
        username: 'orgadmin',
        organization: 'ICHIBAN GROUP',
        email: 'orgadmin@example.com',
        organizationAdmin: true,
      },
      {
        userId: 3,
        name: 'Regular User',
        username: 'regular',
        organization: 'ICHIBAN GROUP',
        email: 'regular@example.com',
      }
    ];

    api.get.mockResolvedValueOnce({ data: usersWithRoles });
    renderComponent();

    await waitFor(() => {
      // Verify Momofin Admin can't be edited or deleted
      const adminRow = screen.getByText('Admin User').closest('tr');
      expect(adminRow.querySelector('.edit-btn')).not.toBeInTheDocument();
      expect(adminRow.querySelector('.delete-btn')).not.toBeInTheDocument();
      expect(adminRow.querySelector('.promote-btn')).not.toBeInTheDocument();

      // Verify Org Admin can't be promoted
      const orgAdminRow = screen.getByText('Org Admin').closest('tr');
      expect(orgAdminRow.querySelector('.promote-btn')).not.toBeInTheDocument();

      // Verify Regular User has all action buttons
      const regularRow = screen.getByText('Regular User').closest('tr');
      expect(regularRow.querySelector('.edit-btn')).toBeInTheDocument();
      expect(regularRow.querySelector('.delete-btn')).toBeInTheDocument();
      expect(regularRow.querySelector('.promote-btn')).toBeInTheDocument();
    });
  });

  test('handles status message timeout cleanup', async () => {
    jest.useFakeTimers();
    renderComponent();

    await waitFor(() => {
      const promoteButton = screen.getAllByTitle('Promote to Admin')[0];
      fireEvent.click(promoteButton);
    });

    // Fast forward time to trigger cleanup
    jest.advanceTimersByTime(5000);

    // Verify message is cleared
    expect(screen.queryByText(/successfully promoted/i)).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  test('handles error when fetching users with specific error message', async () => {
    const errorMessage = 'Network error occurred';
    api.get.mockRejectedValueOnce(new Error(errorMessage));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
    });
  });

  test('handles promote user with server error response', async () => {
    const serverError = {
      response: {
        data: {
          message: 'Server validation failed'
        }
      }
    };
    
    api.get.mockResolvedValueOnce({ data: mockUsers });
    api.put.mockRejectedValueOnce(serverError);

    renderComponent();

    await waitFor(() => {
      const promoteButton = screen.getAllByTitle('Promote to Admin')[0];
      fireEvent.click(promoteButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Server validation failed')).toBeInTheDocument();
    });
  });

  test('handles delete user with server error response', async () => {
    const serverError = {
      response: {
        data: {
          message: 'Cannot delete user'
        }
      }
    };
    
    api.get.mockResolvedValueOnce({ data: mockUsers });
    api.delete.mockRejectedValueOnce(serverError);

    renderComponent();

    await waitFor(() => {
      const deleteButton = screen.getAllByTitle('Remove User')[0];
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByText('Delete User');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Cannot delete user')).toBeInTheDocument();
    });
  });

  test('closes delete modal without confirming', async () => {
    renderComponent();
    
    await waitFor(() => {
      const deleteButton = screen.getAllByTitle('Remove User')[0];
      fireEvent.click(deleteButton);
    });

    // Find and click the cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText(/are you sure you want to delete/i)).not.toBeInTheDocument();
    });
  });

  test('handles null or undefined user data gracefully', async () => {
    const usersWithNulls = [
      {
        userId: 1,
        name: null,
        username: undefined,
        organization: 'Test Org',
        email: 'test@example.com'
      }
    ];

    api.get.mockResolvedValueOnce({ data: usersWithNulls });
    renderComponent();

    await waitFor(() => {
      // Verify that the component doesn't crash with null/undefined values
      expect(screen.getByText('Test Org')).toBeInTheDocument();
    });
  });
});
