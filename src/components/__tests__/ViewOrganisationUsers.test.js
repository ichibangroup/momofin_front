import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';
import ViewUsers from '../ViewOrganisationUsers';

// Mock fetch globally
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
    ]),
  })
);

describe('ViewUsers Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );
    expect(screen.getByTestId('viewUsers-1')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );
    expect(screen.getByText('View All Organisation Users')).toBeInTheDocument();
  });

  it('fetches and displays users', async () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith('https://your-api-endpoint/users');
    });

    expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
    expect(screen.getByText('Sirered')).toBeInTheDocument();
    expect(screen.getByText('CHIEF EXECUTIVE OFFICER')).toBeInTheDocument();
    expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
  });

  it('displays user avatar', async () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    await waitFor(() => {
      const avatar = screen.getByAltText('Galih Ibrahim Kurniawan');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://randomuser.me/api/portraits/men/79.jpg');
    });
  });

  it('renders action buttons for each user', async () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('MAKE ADMIN')).toBeInTheDocument();
      expect(screen.getByText('EDIT')).toBeInTheDocument();
      expect(screen.getByText('DELETE')).toBeInTheDocument();
    });
  });

  it('renders the ADD USER button with correct link', () => {
    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    const addUserButton = screen.getByText('ADD USER');
    expect(addUserButton).toBeInTheDocument();
    expect(addUserButton.closest('a')).toHaveAttribute('href', '/app/configOrganisation/addUserOrgAdmin');
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));

    render(
      <Router>
        <ViewUsers />
      </Router>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});