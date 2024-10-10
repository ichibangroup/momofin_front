import { render, screen, fireEvent } from '@testing-library/react';
import AddUserForm from '../AddUserForm';

// Mock function for onSubmit
const mockOnSubmit = jest.fn();

describe('AddUserForm', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders form fields and submit button', () => {
    render(<AddUserForm title="Add a New User" onSubmit={mockOnSubmit} />);

    // Check if all form fields are rendered
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position/i)).toBeInTheDocument();

    // Check if the submit button is rendered
    expect(screen.getByText(/Add User/i)).toBeInTheDocument();
  });

  test('form input fields update on change', () => {
    render(<AddUserForm title="Add a New User" onSubmit={mockOnSubmit} />);

    // Username input
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput.value).toBe('testuser');

    // Password input
    const passwordInput = screen.getByLabelText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');

    // Email input
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');

    // Position input
    const positionInput = screen.getByLabelText(/Position/i);
    fireEvent.change(positionInput, { target: { value: 'Developer' } });
    expect(positionInput.value).toBe('Developer');
  });

  test('calls onSubmit with correct data when form is submitted', () => {
    render(<AddUserForm title="Add a New User" onSubmit={mockOnSubmit} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Position/i), { target: { value: 'Developer' } });

    // Submit the form
    fireEvent.click(screen.getByText(/Add User/i));

    // Assert onSubmit was called with the correct data
    expect(mockOnSubmit).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      position: 'Developer',
    });
  });

  test('clears the form after submission', () => {
    render(<AddUserForm title="Add a New User" onSubmit={mockOnSubmit} />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Position/i), { target: { value: 'Developer' } });

    // Submit the form
    fireEvent.click(screen.getByText(/Add User/i));

    // Assert that form fields are cleared after submission
    expect(screen.getByLabelText(/Username/i).value).toBe('');
    expect(screen.getByLabelText(/Password/i).value).toBe('');
    expect(screen.getByLabelText(/Email/i).value).toBe('');
    expect(screen.getByLabelText(/Position/i).value).toBe('');
  });

  test('renders title correctly', () => {
    render(<AddUserForm title="Add a New User" onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/Add a New User/i)).toBeInTheDocument();
  });
});
