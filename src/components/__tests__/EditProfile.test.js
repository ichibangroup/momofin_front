import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditProfile from '../components/EditProfile';
import api from '../utils/api';

jest.mock('../utils/api');

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

  test('handles input changes', async () => {
    renderWithRouter(<EditProfile />);
    
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'newusername' } });
      expect(screen.getByLabelText('Username:')).toHaveValue('newusername');

      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'newemail@example.com' } });
      expect(screen.getByLabelText('Email:')).toHaveValue('newemail@example.com');

      fireEvent.change(screen.getByLabelText('Old Password:'), { target: { value: 'oldpass' } });
      expect(screen.getByLabelText('Old Password:')).toHaveValue('oldpass');

      fireEvent.change(screen.getByLabelText('New Password:'), { target: { value: 'newpass' } });
      expect(screen.getByLabelText('New Password:')).toHaveValue('newpass');
    });
  });

  test('submits updated profile with password verification', async () => {
    api.put.mockResolvedValue({ data: { success: true } });
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'newusername' } });
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'newemail@example.com' } });
      fireEvent.change(screen.getByLabelText('Old Password:'), { target: { value: 'oldpass' } });
      fireEvent.change(screen.getByLabelText('New Password:'), { target: { value: 'newpass' } });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/user/profile/123', {
        username: 'newusername',
        email: 'newemail@example.com',
        oldPassword: 'oldpass',
        newPassword: 'newpass'
      });
    });
  });

  test('displays error message on update failure', async () => {
    api.put.mockRejectedValue({ response: { data: { message: 'Invalid old password' } } });
    renderWithRouter(<EditProfile />);

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    });

    expect(await screen.findByText('Invalid old password')).toBeInTheDocument();
  });

  test('displays validation errors for empty fields', async () => {
    renderWithRouter(<EditProfile />);
  
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Old password is required')).toBeInTheDocument();
    });
  });
  
  test('displays validation error for invalid email', async () => {
    renderWithRouter(<EditProfile />);
  
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'invalidemail' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });
});