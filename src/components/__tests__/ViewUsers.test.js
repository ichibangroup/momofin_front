import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewUsers from '../ViewUsers';
import '@testing-library/jest-dom';

const mockUsers = [
  {
    id: 1,
    name: 'Galih Ibrahim Kurniawan',
    username: 'Sirered',
    organization: 'ICHIBAN GROUP',
    email: 'emailme@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/79.jpg'
  }
];

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockUsers),
  })
);

describe('ViewUsers component', () => {
  beforeEach(() => {
    fetch.mockClear(); // Clear the mock before each test
  });

  test('renders the ViewUsers component correctly', async () => {
    render(<ViewUsers />);

    // Check if the title renders
    expect(screen.getByText('View All Users')).toBeInTheDocument();

    // Ensure the fetch is called once
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Check if the user data is rendered correctly
    await waitFor(() => {
      expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
      expect(screen.getByText('Sirered')).toBeInTheDocument();
      expect(screen.getByText('ICHIBAN GROUP')).toBeInTheDocument();
      expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
    });

    // Check for avatar
    expect(screen.getByAltText('Galih Ibrahim Kurniawan')).toBeInTheDocument();

    // Check for actions buttons
    expect(screen.getByText('EDIT')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  test('clicking the edit button', async () => {
    render(<ViewUsers />);

    // Wait for user data to be rendered
    await waitFor(() => {
      expect(screen.getByText('EDIT')).toBeInTheDocument();
    });

    const editButton = screen.getByText('EDIT');
    fireEvent.click(editButton);

    // No action is defined for the button, so just ensure it's clickable
    expect(editButton).toBeEnabled();
  });

  test('clicking the delete button', async () => {
    render(<ViewUsers />);

    // Wait for user data to be rendered
    await waitFor(() => {
      expect(screen.getByText('DELETE')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('DELETE');
    fireEvent.click(deleteButton);

    // No action is defined for the button, so just ensure it's clickable
    expect(deleteButton).toBeEnabled();
  });

  test('handles fetch failure gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject('API error'));

    render(<ViewUsers />);

    // Ensure the fetch was called
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Since no error handling UI is implemented, we only check if the table is still rendered
    expect(screen.getByTestId('viewUsers-1')).toBeInTheDocument();
  });
});
