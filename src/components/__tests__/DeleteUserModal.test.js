import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteUserModal from '../DeleteUserModal';

describe('DeleteUserModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    userName: 'testUser'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeleteUserModal {...defaultProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal content when isOpen is true', () => {
    render(<DeleteUserModal {...defaultProps} />);
    expect(screen.getByText('Confirm User Deletion')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete user/)).toBeInTheDocument();
    // This line was causing the error because of how the text is broken up in the DOM
    expect(screen.getByText((content) => content.includes('testUser'))).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(<DeleteUserModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Delete User button is clicked', () => {
    render(<DeleteUserModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Delete User'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});