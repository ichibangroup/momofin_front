import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import EditProfile from '../EditProfile';
import api from '../../utils/api';
import { validateUserProfile } from '../../utils/validationUtils';
import { sanitizePlainText } from '../../utils/sanitizer';
import userEvent from '@testing-library/user-event';

// Mock the required modules
jest.mock('../../utils/api');
jest.mock('../../utils/validationUtils');
jest.mock('../../utils/sanitizer');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ userId: '123' }),
  useNavigate: () => jest.fn()
}));

// Mock data
const mockUserData = {
  username: 'testuser',
  email: 'test@example.com',
  name: 'Test User',
  position: 'Developer',
  momofinAdmin: true
};

const mockAdminUserData = {
  ...mockUserData,
  roles: ['ROLE_MOMOFIN_ADMIN']
};

describe('EditProfile Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    sanitizePlainText.mockImplementation(text => text);
    validateUserProfile.mockReturnValue({});
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route path="*" element={<EditProfile />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      api.get.mockImplementation(() => new Promise(() => {}));
      renderComponent();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render error state when API fails', async () => {
      api.get.mockRejectedValue(new Error('API Error'));
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch user data. Please try again.')).toBeInTheDocument();
      });
    });

    it('should render form with admin fields when user is admin', async () => {
      api.get.mockResolvedValue({ data: mockAdminUserData });
      renderComponent();
      await waitFor(() => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Position')).toBeInTheDocument();
      });
    });

    it('should render form without admin fields when user is not admin', async () => {
      api.get.mockResolvedValue({ data: { ...mockUserData, momofinAdmin: false } });
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Position')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    beforeEach(() => {
      api.get.mockResolvedValue({ data: mockAdminUserData });
    });

    it('should update form fields when user types', async () => {
      renderComponent();
      await waitFor(() => screen.getByLabelText('Username'));

      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { target: { value: 'newusername' } });
      expect(usernameInput.value).toBe('newusername');
    });

    it('should call validation on form submission', async () => {
      renderComponent();
      await waitFor(() => screen.getByText('Save Changes'));

      fireEvent.click(screen.getByText('Save Changes'));
      expect(validateUserProfile).toHaveBeenCalled();
    });

    it('should not submit if validation fails', async () => {
      validateUserProfile.mockReturnValue({ username: 'Username is required' });
      renderComponent();
      await waitFor(() => screen.getByText('Save Changes'));

      fireEvent.click(screen.getByText('Save Changes'));
      expect(api.put).not.toHaveBeenCalled();
    });

    it('should submit form successfully', async () => {
      api.put.mockResolvedValue({});
      renderComponent();
      await waitFor(() => screen.getByText('Save Changes'));

      fireEvent.click(screen.getByText('Save Changes'));
      await waitFor(() => {
        expect(api.put).toHaveBeenCalled();
      });
    });

    it('should handle API error on submit', async () => {
      api.put.mockRejectedValue({ 
        response: { data: { message: 'Update failed' } }
      });
      renderComponent();
      await waitFor(() => screen.getByText('Save Changes'));

      fireEvent.click(screen.getByText('Save Changes'));
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Password Fields', () => {
    it('should handle password changes', async () => {
      // Mock successful API call for fetching user data
      api.get.mockResolvedValue({ data: mockUserData });
  
      renderComponent();
  
      // Wait for the Old Password input to appear after successful data fetching
      await waitFor(() => {
        expect(screen.getByLabelText('Old Password')).toBeInTheDocument();
      });
  
      const oldPasswordInput = screen.getByLabelText('Old Password');
      const newPasswordInput = screen.getByLabelText('New Password');
  
      fireEvent.change(oldPasswordInput, { target: { value: 'oldPassword123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
  
      expect(oldPasswordInput.value).toBe('oldPassword123');
      expect(newPasswordInput.value).toBe('newPassword123');
    });
  });
  

  describe('Navigation', () => {
    const mockNavigate = jest.fn();
  
    beforeEach(() => {
      jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
      api.get.mockResolvedValue({ data: mockAdminUserData });
    });
  
    afterEach(() => {
      mockNavigate.mockReset();
    });
  
    it('should navigate back on cancel', async () => {
      renderComponent();
      await waitFor(() => screen.getByText('Cancel'));
  
      fireEvent.click(screen.getByText('Cancel'));
      expect(mockNavigate).toHaveBeenCalledWith('/app');
    });
  
    it('should navigate after successful update', async () => {
      api.put.mockResolvedValue({});
      renderComponent();
      await waitFor(() => screen.getByText('Save Changes'));
  
      fireEvent.click(screen.getByText('Save Changes'));
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app');
      });
    });
  });
  

  describe('Data Sanitization', () => {
    beforeEach(() => {
      api.get.mockResolvedValue({ data: mockAdminUserData });
    });
  
    it('should sanitize input values', async () => {
      renderComponent();
      await waitFor(() => screen.getByLabelText('Username'));
  
      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { target: { value: 'test<script>' } });
      expect(sanitizePlainText).toHaveBeenCalledWith('test<script>');
    });
  });
  

  describe('Retry Functionality', () => {
    it('should retry fetching data when retry button is clicked', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'))
           .mockResolvedValueOnce({ data: mockUserData });

      renderComponent();
      await waitFor(() => screen.getByText('Retry'));

      fireEvent.click(screen.getByText('Retry'));
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});