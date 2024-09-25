import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login';
import { act } from 'react';

const renderWithRouter = (component) => {
  return {
    ...render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    ),
  };
};

describe('Login Component', () => {
  test('renders the login form with email and password fields', () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test('allows the user to type an email and password', () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles valid form submission', async () => {
    const mockSubmit = jest.fn();

    renderWithRouter(<Login onSubmit={mockSubmit} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  test('does not submit form with empty fields', async () => {
    const mockSubmit = jest.fn();

    renderWithRouter(<Login onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('does not submit form with invalid email format', async () => {
    const mockSubmit = jest.fn();

    renderWithRouter(<Login onSubmit={mockSubmit} />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('renders "Forgot Password?" link', () => {
    renderWithRouter(<Login />);

    const forgotPasswordLink = screen.getByText(/forgot password\?/i);

    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.getAttribute('href')).toBe('/forgot-password');
  });
});
