import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditProfile from '../components/EditProfile';
import api from '../utils/api';

jest.mock('../utils/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderWithRouter = (ui, { route = '/app/editProfile/123' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/app/editProfile/:userId" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('EditProfile Component', () => {
  test('fetches and displays user data', async () => {
    api.get.mockResolvedValue({ data: { username: 'testuser', email: 'test@example.com' } });
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      expect(screen.getByLabelText('Username:')).toHaveValue('testuser');
      expect(screen.getByLabelText('Email:')).toHaveValue('test@example.com');
    });

    expect(api.get).toHaveBeenCalledWith('/api/user/profile/123');
  });

  test('updates profile with correct old password', async () => {
    api.get.mockResolvedValue({ data: { username: 'testuser', email: 'test@example.com' } });
    api.put.mockResolvedValue({ data: { success: true } });
    
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'newusername' } });
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'newemail@example.com' } });
      fireEvent.change(screen.getByLabelText('Old Password:'), { target: { value: 'correctoldpass' } });
      fireEvent.change(screen.getByLabelText('New Password:'), { target: { value: 'newpass' } });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/user/profile/123', {
        username: 'newusername',
        email: 'newemail@example.com',
        oldPassword: 'correctoldpass',
        newPassword: 'newpass'
      });
    });
  });

  test('displays error for incorrect old password', async () => {
    api.get.mockResolvedValue({ data: { username: 'testuser', email: 'test@example.com' } });
    api.put.mockRejectedValue({ response: { data: { message: 'Invalid old password' } } });
    
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Old Password:'), { target: { value: 'wrongoldpass' } });
      fireEvent.change(screen.getByLabelText('New Password:'), { target: { value: 'newpass' } });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid old password')).toBeInTheDocument();
    });
  });
});