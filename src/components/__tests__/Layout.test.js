import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Layout from '../Layout';

// Mock the api module
jest.mock('../../utils/api', () => ({
  get: jest.fn(),
}));

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Import the mocked api after mocking
import api from '../../utils/api';

//RAHHHHHHHHHH

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders layout correctly', async () => {
    api.get.mockResolvedValue({ data: { userId: '123' } });

    await act(async () => {
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('MOMOFIN')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload and Verify')).toBeInTheDocument();
    expect(screen.getByText('Momofin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Config Organisation')).toBeInTheDocument();
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  test('fetches user info on mount', async () => {
    const mockUserData = { userId: '123' };
    api.get.mockResolvedValue({ data: mockUserData });

    await act(async () => {
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      );
    });

    expect(api.get).toHaveBeenCalledWith('/auth/info');
  });

  test('handles error when fetching user info', async () => {
    api.get.mockRejectedValue(new Error('API error'));

    await act(async () => {
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Failed to fetch user information')).toBeInTheDocument();
  });

  test('toggles sidebar when hamburger is clicked', async () => {
    api.get.mockResolvedValue({ data: { userId: '123' } });

    await act(async () => {
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      );
    });

    const wrapper = screen.getByTestId('wrapper');
    const hamburger = screen.getByTestId('hamburger');

    expect(wrapper).not.toHaveClass('active');
    fireEvent.click(hamburger);
    expect(wrapper).toHaveClass('active');
    fireEvent.click(hamburger);
    expect(wrapper).not.toHaveClass('active');
  });

  test('navigates to login page on logout', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    api.get.mockResolvedValue({ data: { userId: '123' } });

    await act(async () => {
      render(
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      );
    });

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});