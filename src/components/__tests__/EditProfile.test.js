import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditProfile from './EditProfile';
import api from '../utils/api';
import { validateUserProfile } from '../utils/validationUtils';

jest.mock('../utils/api');
jest.mock('../utils/validationUtils');

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

  test('submits form with password change', async () => {
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'newusername' } });
      fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'newemail@example.com' } });
      fireEvent.change(screen.getByLabelText(/Old Password:/i), { target: { value: 'oldpassword' } });
      fireEvent.change(screen.getByLabelText(/New Password:/i), { target: { value: 'newpassword' } });
    });

    api.put.mockResolvedValue({ status: 200 });

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/user/profile/1',
        expect.objectContaining({
          username: 'newusername',
          email: 'newemail@example.com',
          oldPassword: 'oldpassword',
          newPassword: 'newpassword'
        }),
        expect.objectContaining({
          params: {
            oldPassword: 'oldpassword',
            newPassword: 'newpassword'
          }
        })
      );
    });
  });

  test('displays validation errors', async () => {
    validateUserProfile.mockReturnValue({ username: 'Username is required' });
    renderWithRouter(<EditProfile />);

    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
    });
  });

  test('displays API error', async () => {
    api.get.mockRejectedValue(new Error('API Error'));
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch user data. Please try again./i)).toBeInTheDocument();
    });
  });
});