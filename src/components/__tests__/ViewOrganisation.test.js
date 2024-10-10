import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewOrganisation from '../viewOrganisation';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the fetch function
global.fetch = jest.fn();

describe('ViewOrganisation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with initial data', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    expect(screen.getByText('View Organizations')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Organization 2')).toBeInTheDocument();
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

  it('renders organization data correctly', () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    expect(screen.getByText('Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, City, State, Country')).toBeInTheDocument();
    expect(screen.getByText('This is a long description about Organization 1. It provides technology solutions.')).toBeInTheDocument();

    expect(screen.getByText('Organization 2')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
    expect(screen.getByText('456 Oak St, City, State, Country')).toBeInTheDocument();
    expect(screen.getByText('This is a shorter description for Organization 2.')).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDescription = 'A'.repeat(150);
    const organizations = [
      { id: 1, name: 'Test Org', industry: 'Test', address: 'Test Address', description: longDescription },
    ];
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    expect(screen.getByText(`${'A'.repeat(100)}...`)).toBeInTheDocument();
  });

  it('displays edit and delete buttons for each organization', () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    const editButtons = screen.getAllByText('EDIT');
    const deleteButtons = screen.getAllByText('DELETE');

    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
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

  it('fetches organizations from API on component mount', async () => {
    const mockOrganizations = [
      { id: 3, name: 'API Org', industry: 'API', address: 'API Address', description: 'API Description' },
    ];

    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockOrganizations),
    });

    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://your-api-endpoint/organizations');
      expect(screen.getByText('API Org')).toBeInTheDocument();
    });
  });

  it('handles API fetch error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

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