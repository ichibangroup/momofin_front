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

    it('should clear field-specific error when input changes', async () => {
      // Set up initial error state
      validateUserProfile.mockReturnValue({ username: 'Username is required' });
      
      renderComponent();
      await waitFor(() => screen.getByLabelText('Username'));

      // Trigger form submission to get error state
      fireEvent.click(screen.getByText('Save Changes'));
      
      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });

      // Change input to trigger error clearing
      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { 
        target: { name: 'username', value: 'newusername' } 
      });

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
      });
    });

    it('should show reauth alert and navigate to login when username is changed', async () => {
      // Mock successful API update
      api.put.mockResolvedValue({});
      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate')
          .mockReturnValue(mockNavigate);
  
      // Render component
      renderComponent();
      
      // Wait for component to load
      await waitFor(() => screen.getByLabelText('Username'));
  
      // Change username
      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { 
        target: { name: 'username', value: 'newusername' } 
      });
  
      // Submit form
      fireEvent.click(screen.getByText('Save Changes'));
  
      // Verify reauth alert appears
      await waitFor(() => {
        expect(screen.getByText('Changing your username will require you to login again.')).toBeInTheDocument();
      });
  
      // Wait for the setTimeout
      await new Promise(resolve => setTimeout(resolve, 100));
  
      // Verify API call
      await waitFor(() => {
        expect(api.put).toHaveBeenCalled();
      });
  
      // Verify navigation to login with correct state
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', {
          state: {
            message: 'Your username has been updated. Please login again with your new username.',
            username: 'newusername'
          }
        });
      });
    });

    it('should not show reauth alert or navigate to login when username is unchanged', async () => {
      // Mock successful API update
      api.put.mockResolvedValue({});
      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate')
          .mockReturnValue(mockNavigate);
  
      // Render component
      renderComponent();
      
      // Wait for component to load
      await waitFor(() => screen.getByLabelText('Username'));
  
      // Change email (but not username)
      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { 
        target: { name: 'email', value: 'newemail@example.com' } 
      });
  
      // Submit form
      fireEvent.click(screen.getByText('Save Changes'));
  
      // Verify reauth alert does not appear
      await waitFor(() => {
        expect(screen.queryByText('Changing your username will require you to login again.')).not.toBeInTheDocument();
      });
  
      // Verify API call
      await waitFor(() => {
        expect(api.put).toHaveBeenCalled();
      });
  
      // Verify navigation to app instead of login
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/app');
      });
    });

    it('should hide reauth alert and clear error when API call fails', async () => {
      // Mock failed API update
      api.put.mockRejectedValue({ 
        response: { data: { message: 'Update failed' } }
      });
      
      const mockNavigate = jest.fn();
      jest.spyOn(require('react-router-dom'), 'useNavigate')
          .mockReturnValue(mockNavigate);
  
      // Render component
      renderComponent();
      
      // Wait for component to load
      await waitFor(() => screen.getByLabelText('Username'));
  
      // Change username
      const usernameInput = screen.getByLabelText('Username');
      fireEvent.change(usernameInput, { 
        target: { name: 'username', value: 'newusername' } 
      });
  
      // Submit form
      fireEvent.click(screen.getByText('Save Changes'));
  
      // Verify reauth alert appears initially
      await waitFor(() => {
        expect(screen.getByText('Changing your username will require you to login again.')).toBeInTheDocument();
      });
  
      // Verify error message appears and reauth alert is hidden after API failure
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
        expect(screen.queryByText('Changing your username will require you to login again.')).not.toBeInTheDocument();
      });
  
      // Verify we didn't navigate
      expect(mockNavigate).not.toHaveBeenCalled();
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