import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';
import api from 'src/utils/api'; // Use an absolute import

// Mock the api module
jest.mock('../utils/api', () => ({
  get: jest.fn(),
}));

// Mock the Outlet component from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Layout component with navigation links', async () => {
    api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    renderWithRouter(<Layout />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Upload and Verify')).toBeInTheDocument();
    expect(screen.getByText('View Users')).toBeInTheDocument();
    expect(screen.getByText('View Organisations')).toBeInTheDocument();
    expect(screen.getByText('Config Organisation')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  test('fetches user info on mount', async () => {
    api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    renderWithRouter(<Layout />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/auth/info');
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  test('displays error message when API call fails', async () => {
    api.get.mockRejectedValueOnce(new Error('API Error'));
    renderWithRouter(<Layout />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user information')).toBeInTheDocument();
    });
  });

  test('toggles dropdown menu', async () => {
    api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    renderWithRouter(<Layout />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const dropdownButton = screen.getByText('Test User');
    fireEvent.click(dropdownButton);

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();

    fireEvent.click(dropdownButton);

    expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Log Out')).not.toBeInTheDocument();
  });

  test('renders Outlet component', () => {
    api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    renderWithRouter(<Layout />);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  test('renders footer', () => {
    api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    renderWithRouter(<Layout />);

    expect(screen.getByText(/© 2024 Your App Name. All rights reserved./)).toBeInTheDocument();
  });

  test('navigates to Edit Profile page', async () => {
    api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    renderWithRouter(<Layout />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test User'));
    fireEvent.click(screen.getByText('Edit Profile'));

    expect(window.location.pathname).toBe('/editProfile');
  });

  test('Log Out button is present', async () => {
    api.get.mockResolvedValueOnce({ data: { name: 'Test User' } });
    renderWithRouter(<Layout />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test User'));
    expect(screen.getByText('Log Out')).toBeInTheDocument();
    // Note: Add more assertions if you implement logout functionality
  });
});