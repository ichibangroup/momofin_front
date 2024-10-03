import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewUsers from '../ViewUsers';

describe('ViewUsers Component', () => {
  test('renders ViewUsers component', () => {
    render(<ViewUsers />);
    
    // Check if the component renders with the correct test id
    const viewUsersElement = screen.getByTestId('viewUsers-1');
    expect(viewUsersElement).toBeInTheDocument();
  });

  test('displays the correct title', () => {
    render(<ViewUsers />);
    
    const titleElement = screen.getByText('View Users');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('title');
  });

  test('displays the placeholder text', () => {
    render(<ViewUsers />);
    
    const placeholderText = screen.getByText('This is a placeholder page for viewing users. User data will be displayed here in the future.');
    expect(placeholderText).toBeInTheDocument();
  });

  test('renders the user list container', () => {
    render(<ViewUsers />);
    
    const userListElement = screen.getByTestId('user-list');
    expect(userListElement).toBeInTheDocument();
    expect(userListElement).toHaveClass('user-list');
  });

  test('displays the correct number of user items', () => {
    render(<ViewUsers />);
    
    const userItems = screen.getAllByTestId('user-item');
    expect(userItems).toHaveLength(3);
    userItems.forEach(item => {
      expect(item).toHaveClass('user-item');
    });
  });
});