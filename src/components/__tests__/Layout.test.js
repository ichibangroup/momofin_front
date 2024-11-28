import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react';
import Layout from '../Layout';
import api from '../../utils/api'; 
import { setAuthToken } from '../../utils/auth'; // Importing for the test

jest.mock('../../utils/api', () => ({
  get: jest.fn(),
}));

jest.mock('../../utils/auth', () => ({
  setAuthToken: jest.fn(),
}));

jest.mock('../../utils/logoutLogger', () => ({
  LogoutActivityLogger: {
    logLogoutAttempt: jest.fn(),
    logLogoutSuccess: jest.fn(),
    logLogoutFailure: jest.fn(),
    logNavigationAfterLogout: jest.fn(),
  }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLayout = async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      );
    });
  };

  test('renders layout correctly', async () => {
    api.get.mockResolvedValue({ data: { userId: '123', roles: ['ROLE_MOMOFIN_ADMIN', 'ROLE_ORG_ADMIN'], organization: { organizationId: '456' } } });

    await renderLayout();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload and Verify')).toBeInTheDocument();
    expect(screen.queryByText(/Momofin Dashboard/i)).toBeInTheDocument();
    expect(screen.queryByText(/Config Organisation/i)).toBeInTheDocument();
    expect(screen.queryByText(/Edit Profile/i)).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  test('fetches user info on mount', async () => {
    api.get.mockResolvedValue({ data: { userId: '123' } });

    await renderLayout();

    expect(api.get).toHaveBeenCalledWith('/auth/info');
  });

  test('handles error when fetching user info', async () => {
    api.get.mockRejectedValue(new Error('API error'));

    await renderLayout();

    expect(screen.getByText('Failed to fetch user information')).toBeInTheDocument();
  });

  test('toggles sidebar when hamburger is clicked', async () => {
    api.get.mockResolvedValue({ data: { userId: '123' } });

    await renderLayout();

    const wrapper = screen.getByTestId('wrapper');
    const hamburger = screen.getByTestId('hamburger');

    expect(wrapper).not.toHaveClass('active');
    fireEvent.click(hamburger);
    expect(wrapper).toHaveClass('active');
    fireEvent.click(hamburger);
    expect(wrapper).not.toHaveClass('active');
  });

  test('navigates to login page on logout if no user data', async () => {
    // Simulate user data being fetched
    api.get.mockResolvedValue({ data: { userId: '123' } });

    await renderLayout();

    // Ensure the 'Log Out' button is present
    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    // Assert the navigation
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { message: 'You have been successfully logged out.' } });
});


  test('logs successful logout attempt', async () => {
    api.get.mockResolvedValue({ data: { userId: '123', username: 'testUser', organization: { organizationId: '456' } } });

    await renderLayout();

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { message: 'You have been successfully logged out.' } });
    expect(require('../../utils/logoutLogger').LogoutActivityLogger.logLogoutSuccess).toHaveBeenCalledWith('123', '456', 'testUser');
  });

  test('handles logout failure', async () => {
    api.get.mockResolvedValue({ data: { userId: '123', organization: { organizationId: '456' } } });

    // Simulate a logout failure
    require('../../utils/logoutLogger').LogoutActivityLogger.logLogoutSuccess.mockImplementation(() => {
      throw new Error('Logout failed');
    });

    await renderLayout();

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(setAuthToken).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(require('../../utils/logoutLogger').LogoutActivityLogger.logLogoutFailure).toHaveBeenCalledWith('123', '456', expect.any(Error));
  });

  test('navigates to login page if no user data', async () => {
    // Simulate no user data
    api.get.mockResolvedValue({ data: null });

    await renderLayout();

    // Check if setAuthToken is called
    expect(setAuthToken).toHaveBeenCalled();

    // Verify navigation to login page
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  describe('Edit Requests Count', () => {
    const mockUser = {
      userId: '123',
      username: 'testuser',
      roles: ['ROLE_USER'],
      organization: {
        organizationId: 'org123'
      }
    };
    const mockEditRequests = [
      { id: 1, status: 'pending' },
      { id: 2, status: 'pending' }
    ];

    beforeEach(() => {
      api.get.mockImplementation((url) => {
        if (url === '/auth/info') {
          return Promise.resolve({ data: mockUser });
        }
        if (url === '/doc/edit-request') {
          return Promise.resolve({ data: mockEditRequests });
        }
        return Promise.reject(new Error('Not found'));
      });
    });

    it('should fetch and display edit requests count', async () => {
      await act(async () => {
        renderLayout();
      });

      // Wait for the badge to appear
      const badge = await screen.findByText('2');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('badge');
    });

    it('should not display badge when there are no edit requests', async () => {
      api.get.mockImplementation((url) => {
        if (url === '/auth/info') {
          return Promise.resolve({ data: mockUser });
        }
        if (url === '/doc/edit-request') {
          return Promise.resolve({ data: [] });
        }
        return Promise.reject(new Error('Not found'));
      });

      await act(async () => {
        renderLayout();
      });

      // Wait for any potential badge to appear
      await waitFor(() => {
        const badge = screen.queryByText('0');
        expect(badge).not.toBeInTheDocument();
      });
    });

    it('should handle edit requests fetch error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      api.get.mockImplementation((url) => {
        if (url === '/auth/info') {
          return Promise.resolve({ data: mockUser });
        }
        if (url === '/doc/edit-request') {
          return Promise.reject(new Error('Failed to fetch'));
        }
        return Promise.reject(new Error('Not found'));
      });

      await act(async () => {
        renderLayout();
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });


});

