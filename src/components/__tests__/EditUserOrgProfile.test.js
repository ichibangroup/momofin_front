import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import EditUserOrgProfile from '../EditUserOrgProfile';
import api from '../../utils/api';

// Mock the react-router-dom modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: () => jest.fn()
}));

// Mock the api module
jest.mock('../../utils/api');

describe('EditUserOrgProfile', () => {
  const mockUserId = '123';
  const mockUserData = {
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    position: 'Developer'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useParams to return our test userId
    useParams.mockReturnValue({ userId: mockUserId });
    
    // Mock successful API response
    api.get.mockResolvedValue({ data: mockUserData });
  });

  test('renders loading state initially', () => {
    render(
      <Router>
        <EditUserOrgProfile />
      </Router>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders form with user data after loading', async () => {
    render(
      <Router>
        <EditUserOrgProfile />
      </Router>
    );

    // Wait for the loading state to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check if all form fields are rendered with correct values
    expect(screen.getByLabelText('Name')).toHaveValue(mockUserData.name);
    expect(screen.getByLabelText('Username')).toHaveValue(mockUserData.username);
    expect(screen.getByLabelText('Email')).toHaveValue(mockUserData.email);
    expect(screen.getByLabelText('Position')).toHaveValue(mockUserData.position);
  });

  test('handles form input changes correctly', async () => {
    render(
      <Router>
        <EditUserOrgProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(nameInput).toHaveValue('New Name');

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    expect(emailInput).toHaveValue('new@example.com');
  });

  test('handles form submission successfully', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    api.put.mockResolvedValueOnce({ data: mockUserData });

    render(
      <Router>
        <EditUserOrgProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        `/api/user/profile/${mockUserId}`,
        expect.any(Object)
      );
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  test('handles API error during form submission', async () => {
    const errorMessage = 'Failed to update profile';
    api.put.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(
      <Router>
        <EditUserOrgProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles API error during data fetch', async () => {
    api.get.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <Router>
        <EditUserOrgProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user data. Please try again.')).toBeInTheDocument();
    });

    // Test retry functionality
    const retryButton = screen.getByText('Retry');
    api.get.mockResolvedValueOnce({ data: mockUserData });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.queryByText('Failed to fetch user data. Please try again.')).not.toBeInTheDocument();
    });
  });

  test('handles navigation on cancel button click', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    render(
      <Router>
        <EditUserOrgProfile />
      </Router>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/app');
  });

  test('sanitizes potentially harmful input to prevent XSS', async () => {
    render(
        <Router>
          <EditUserOrgProfile />
        </Router>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('Name');

    const xssInput = '<img src=x onerror=alert("XSS")>';
    fireEvent.change(nameInput, { target: { value: xssInput } });

    const submitButton = screen.getByText('Save Changes');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
          `/api/user/profile/${mockUserId}`,
          expect.objectContaining({
            name: expect.not.stringContaining('<img src=x onerror=alert("XSS)>')
          })
      );
    });

    expect(screen.queryByText('<img src=x onerror=alert("XSS")>')).not.toBeInTheDocument();
  });
});