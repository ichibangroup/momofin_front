import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {BrowserRouter, MemoryRouter, Route, Routes} from 'react-router-dom';
import ViewOrganisation from '../viewOrganisation';
import ViewOrganisationUsers from "../ViewOrganisationUsers";
import api from "../../utils/api";

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockOrganisations = [{
      id: 1,
      name: 'Organization 1',
      industry: 'Technology',
      address: '123 Main St, City, State, Country',
      description: 'This is a long description about Organization 1. It provides technology solutions.',
    },
    {
      id: 2,
      name: 'Organization 2',
      industry: 'Healthcare',
      address: '456 Oak St, City, State, Country',
      description: 'This is a shorter description for Organization 2.',
    },
    {
      id: 3,
      name: 'Organization 3',
      industry: 'Entertainment',
      address: 'Depok City',
      description: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },]
jest.mock('../../utils/api');
// Mock the fetch function
global.fetch = jest.fn();

describe('ViewOrganisation Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup the api.get mock with the default successful response
    api.get.mockResolvedValue({
      data: mockOrganisations,
      status: 200
    });
  });

  it('navigates back when the back button is clicked', () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Back'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders organization data correctly', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');
    });

    await waitFor(() => {
      expect(screen.getByText('Organization 1')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, City, State, Country')).toBeInTheDocument();
      expect(screen.getByText('This is a long description about Organization 1. It provides technology solutions.')).toBeInTheDocument();

      expect(screen.getByText('Organization 2')).toBeInTheDocument();
      expect(screen.getByText('Healthcare')).toBeInTheDocument();
      expect(screen.getByText('456 Oak St, City, State, Country')).toBeInTheDocument();
      expect(screen.getByText('This is a shorter description for Organization 2.')).toBeInTheDocument();
    })
  });

  it('truncates long descriptions', async () => {
    const longDescription = 'A'.repeat(150);
    const organizations = [
      { id: 1, name: 'Test Org', industry: 'Test', address: 'Test Address', description: longDescription },
    ];
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');
      expect(screen.getByText(`${'A'.repeat(100)}...`)).toBeInTheDocument();
    });
  });

  it('displays edit and delete buttons for each organization', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');

      const editButtons = screen.getAllByText('EDIT');
      const deleteButtons = screen.getAllByText('DELETE');

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });
  });

  it('navigates to add new organisation page when "Add Organisation" button is clicked', () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add Organisation'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/momofinDashboard/addNewOrganisation');
  });

  it('handles API fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    api.get.mockImplementationOnce(() => Promise.reject(new Error('API Error')));

    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching organizations:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('displays "No organizations" message when there are no organizations', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce([]),
    });

    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No organizations to display yet. Please add an organization.')).toBeInTheDocument();
    });
  });
});