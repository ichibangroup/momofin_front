import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    expect(screen.getByText('MOMOFIN')).toBeInTheDocument();
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

});
