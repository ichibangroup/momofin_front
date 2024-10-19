import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {BrowserRouter as Router, MemoryRouter, Routes, Route} from 'react-router-dom';
import ViewUsers from '../ViewOrganisationUsers';
import api from "../../utils/api";
import ViewOrganisationUsers from "../ViewOrganisationUsers";
import Layout from "../Layout";

const mockUsers = [
  {
    id: 1,
    name: 'Galih Ibrahim Kurniawan',
    username: 'Sirered',
    position: 'CHIEF EXECUTIVE OFFICER',
    email: 'emailme@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/79.jpg',
    organisation: 'ICHIBAN GROUP',
  },
];

const renderWithRouter = (organizationId = '123') => {
  return render(
      <MemoryRouter initialEntries={[`/app/configOrganisation/${organizationId}/viewOrganisationUsers`]}>
        <Routes>
            <Route
                path="/app/configOrganisation/:id/viewOrganisationUsers"
                element={<ViewOrganisationUsers />}
            />
        </Routes>
      </MemoryRouter>
  );
};

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
      },
    ]),
  })
);

jest.mock('../../utils/api');

describe('ViewUsers Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup the api.get mock with the default successful response
    api.get.mockResolvedValue({
      data: mockUsers,
      status: 200
    });
  });


  it('renders without crashing', () => {
    renderWithRouter('123')
    expect(screen.getByTestId('viewUsers-1')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    renderWithRouter('123')
    expect(screen.getByText('View All Organisation Users')).toBeInTheDocument();
  });

  it('fetches and displays users', async () => {
    renderWithRouter('123');

    // Wait for the API call to complete
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123/users');
    });

    // Wait for the user data to be displayed
    await waitFor(() => {
      expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
      expect(screen.getByText('Sirered')).toBeInTheDocument();
      expect(screen.getByText('CHIEF EXECUTIVE OFFICER')).toBeInTheDocument();
      expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
    });
  });

  it('displays user avatar', async () => {
    renderWithRouter('123')

    await waitFor(() => {
      const avatar = screen.getByAltText('Sirered');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://randomuser.me/api/portraits/men/79.jpg');
    });
  });

  it('renders action buttons for each user', async () => {
    renderWithRouter('123')

    await waitFor(() => {
      expect(screen.getByText('MAKE ADMIN')).toBeInTheDocument();
      expect(screen.getByText('EDIT')).toBeInTheDocument();
      expect(screen.getByText('DELETE')).toBeInTheDocument();
    });
  });

  it('renders the ADD USER button with correct link', () => {
    renderWithRouter('123')

    const addUserButton = screen.getByText('ADD USER');
    expect(addUserButton).toBeInTheDocument();
    expect(addUserButton.closest('a')).toHaveAttribute('href', '/app/configOrganisation/123/addUserOrgAdmin');
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockImplementationOnce(() => Promise.reject(new Error('API Error')));

    renderWithRouter('123')

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching organisation users:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});