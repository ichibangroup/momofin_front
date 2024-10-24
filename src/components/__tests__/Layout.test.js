import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react'; // Import act from react
import Layout from '../Layout';
import api from '../../utils/api'; // Import after mocking

// Mock the API module
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
}));

// Mock useNavigate correctly
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function for rendering the Layout with BrowserRouter
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

    // Use a regex matcher for "Momofin Dashboard" and other elements with complex nesting
    expect(screen.queryByText((content) => content.includes('Momofin Dashboard'))).toBeInTheDocument();
    expect(screen.queryByText(/Config Organisation/i)).toBeInTheDocument();
    expect(screen.queryByText(/Edit Profile/i)).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  test('fetches user info on mount', async () => {
    const mockUserData = { userId: '123' };
    api.get.mockResolvedValue({ data: mockUserData });

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

  test('navigates to login page on logout', async () => {
    api.get.mockResolvedValue({ data: { userId: '123' } });

    await renderLayout();

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
