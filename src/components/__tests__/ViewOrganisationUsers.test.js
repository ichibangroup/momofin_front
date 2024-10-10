import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewUsers from '../ViewOrganisationUsers'; // Adjust import based on the actual file location

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      {
        id: 1,
        name: 'Galih Ibrahim Kurniawan',
        username: 'Sirered',
        position: 'CHIEF EXECUTIVE OFFICER',
        email: 'emailme@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/79.jpg',
        organisation: 'ICHIBAN GROUP',
      },
      {
        id: 2,
        name: 'Sam Jones',
        username: 'samjones',
        position: 'CHIEF TECHNOLOGY OFFICER',
        email: 'sam@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/80.jpg',
        organisation: 'ICHIBAN GROUP',
      },
    ]),
  })
);

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};

describe('ViewUsers Component', () => {
  beforeEach(() => {
    fetch.mockClear(); // Clear the mock before each test
  });

  test('renders the component with the correct title', async () => {
    renderWithRouter(<ViewUsers />);

    expect(screen.getByText('View All Organisation Users')).toBeInTheDocument();
  });

  test('renders the user table with headers', async () => {
    renderWithRouter(<ViewUsers />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('fetches and displays users correctly', async () => {
    renderWithRouter(<ViewUsers />);

    // Wait for the users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
      expect(screen.getByText('CHIEF EXECUTIVE OFFICER')).toBeInTheDocument();
      expect(screen.getByText('Sirered')).toBeInTheDocument();
      expect(screen.getByText('emailme@example.com')).toBeInTheDocument();

      expect(screen.getByText('Sam Jones')).toBeInTheDocument();
      expect(screen.getByText('CHIEF TECHNOLOGY OFFICER')).toBeInTheDocument();
      expect(screen.getByText('samjones')).toBeInTheDocument();
      expect(screen.getByText('sam@example.com')).toBeInTheDocument();
    });
  });

  test('renders action buttons for each user', async () => {
    renderWithRouter(<ViewUsers />);

    // Wait for the users to be loaded
    await waitFor(() => {
      expect(screen.getAllByText('MAKE ADMIN')).toHaveLength(2);
      expect(screen.getAllByText('EDIT')).toHaveLength(2);
      expect(screen.getAllByText('DELETE')).toHaveLength(2);
    });
  });

  test('renders "Add User" button and navigates to the correct path', async () => {
    renderWithRouter(<ViewUsers />);

    const addUserButton = screen.getByText('ADD USER');
    expect(addUserButton).toBeInTheDocument();

    fireEvent.click(addUserButton);

    expect(window.location.pathname).toBe('/app/configOrganisation/addUserOrgAdmin');
  });
});
