import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import EditProfile from '../EditProfile';
import api from '../../utils/api';
import { validateUserProfile } from '../../utils/validationUtils';
import { sanitizePlainText } from '../../utils/sanitizer'; // Importing the sanitizer for verification

jest.mock('../../utils/api');
jest.mock('../../utils/validationUtils');
jest.mock('../../utils/sanitizer'); // Mock the sanitizer utility

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ userId: '1' }),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (ui, { route = '/editProfile/1' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/editProfile/:userId" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('EditProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { username: 'testuser', email: 'test@example.com' } });
    validateUserProfile.mockReturnValue({});
  });

  test('renders EditProfile form with fetched user data', async () => {
    renderWithRouter(<EditProfile />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Username:/i)).toHaveValue('testuser');
      expect(screen.getByLabelText(/Email:/i)).toHaveValue('test@example.com');
    });
  });

  test('submits form and navigates on success', async () => {
    api.put.mockResolvedValue({ status: 200 });
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'newusername' } });
      fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'newemail@example.com' } });
    });

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  });

  test('displays API error on fetch', async () => {
    api.get.mockRejectedValue(new Error('API Error'));
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch user data. Please try again./i)).toBeInTheDocument();
    });
  });

  test('displays validation errors', async () => {
    validateUserProfile.mockReturnValue({ username: 'Username is required' });
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Save Changes/i));
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    });
  });

  test('handles API error on update', async () => {
    api.put.mockRejectedValue({ response: { data: { message: 'Update failed' } } });
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'newusername' } });
    });

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  test('handles API error without specific message on update', async () => {
    api.put.mockRejectedValue(new Error('Some error'));
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'newusername' } });
    });

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile. Please try again.')).toBeInTheDocument();
    });
  });

  // New tests for updateUserProfile
  test('sanitizes input before sending to API', async () => {
    sanitizePlainText.mockImplementation((input) => `sanitized-${input}`);
    api.put.mockResolvedValue({ status: 200 });
  
    renderWithRouter(<EditProfile />);
  
    // Wait for the loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  
    // Now interact with the inputs
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
  
    fireEvent.click(screen.getByText(/Save Changes/i));
  
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        expect.any(String), 
        { username: 'sanitized-testuser', email: 'sanitized-test@example.com' }, 
        expect.any(Object)
      );
    });
  });
  
  test('does not navigate on API error during update', async () => {
    api.put.mockRejectedValue(new Error('Update failed'));
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'newusername' } });
    });

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled(); // Ensure navigate was not called
    });
  });
});
