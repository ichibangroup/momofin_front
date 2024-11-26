import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewOrganisations from '../ViewOrg';
import api from '../../utils/api';

// Mock the entire api module
jest.mock('../../utils/api');

// Mock react-router's useNavigate hook
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

const mockOrganizations = [
  {
    organizationId: '1',
    name: 'Org A',
    industry: 'Technology',
    location: 'New York',
    description: 'Tech company'
  },
  {
    organizationId: '2',
    name: 'Org B',
    industry: 'Finance',
    location: 'San Francisco',
    description: 'Financial services'
  }
];

describe('ViewOrganisations Component', () => {
  // Mocking timer functions
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  // Test rendering and fetching organizations
  test('renders organizations and handles loading state', async () => {
    // Mock successful API call
    api.get.mockResolvedValue({ data: mockOrganizations });

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    // Check loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
      expect(screen.getByText('Org B')).toBeInTheDocument();
    });

    // Verify API call
    expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');
  });

  // Test organizations fetch error
  test('handles organizations fetch error', async () => {
    // Mock API error
    api.get.mockRejectedValue(new Error('Fetch failed'));

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch organizations/i)).toBeInTheDocument();
    });
  });

  // Test sorting functionality
  test('sorts organizations by different columns', async () => {
    api.get.mockResolvedValue({ data: mockOrganizations });

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });

    // Click on sort headers
    const nameHeader = screen.getByText('Name');
    const industryHeader = screen.getByText('Industry');

    fireEvent.click(nameHeader);
    fireEvent.click(industryHeader);

    // Additional assertions could be added to verify sorting
  });

  // Test edit functionality
  test('edits organization successfully', async () => {
    api.get.mockResolvedValue({ data: mockOrganizations });
    api.put.mockResolvedValue({
      data: {
        ...mockOrganizations[0],
        industry: 'Updated Tech'
      }
    });

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });

    // Find and click edit button
    const editButtons = screen.getAllByTitle('Edit Organisation');
    fireEvent.click(editButtons[0]);

    // Edit inputs
    const industryInput = screen.getByDisplayValue('Technology');
    fireEvent.change(industryInput, { target: { value: 'Updated Tech' } });

    // Save changes
    const saveButton = screen.getByTitle('Save Changes');
    fireEvent.click(saveButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Organization updated successfully/i)).toBeInTheDocument();
    });
  });

  // Test delete functionality
  test('deletes organization successfully', async () => {
    api.get.mockResolvedValue({ data: mockOrganizations });
    api.delete.mockResolvedValue({});

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });

    // Open delete dialog
    const deleteButtons = screen.getAllByTitle('Delete Organisation');
    fireEvent.click(deleteButtons[0]);

    // Confirm delete
    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/has been successfully deleted/i)).toBeInTheDocument();
    });
  });

// Test status message disappears after timeout
test('status message disappears after timeout', async () => {
    // Use fake timers
    jest.useFakeTimers();
  
    // Mock API calls
    api.get.mockResolvedValue({ data: mockOrganizations });
    api.put.mockRejectedValue(new Error('Update failed'));
  
    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );
  
    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });
  
    // Attempt edit to trigger status message
    const editButtons = screen.getAllByTitle('Edit Organisation');
    fireEvent.click(editButtons[0]);
  
    // Edit inputs
    const industryInput = screen.getByDisplayValue('Technology');
    fireEvent.change(industryInput, { target: { value: 'Updated Tech' } });
  
    // Save changes
    const saveButton = screen.getByTitle('Save Changes');
    fireEvent.click(saveButton);
  
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to update organization/i)).toBeInTheDocument();
    });
  
    // Fast-forward timers
    jest.advanceTimersByTime(5000);

  await waitFor(() => {
    // Verify status message is cleared
    expect(screen.queryByText(/Failed to update organization/i)).toBeNull();
  });
  });



  // Test multiple error scenarios with more comprehensive error handling
  test('handles multiple error scenarios', async () => {
    // Mock edit errors with different response scenarios
    api.get.mockResolvedValue({ data: mockOrganizations });
    
    // Simulate an error response with a custom error message
    const mockErrorResponse = {
      response: {
        data: {
          message: 'Specific update error'
        }
      }
    };
    api.put.mockRejectedValue(mockErrorResponse);

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });

    // Attempt edit
    const editButtons = screen.getAllByTitle('Edit Organisation');
    fireEvent.click(editButtons[0]);

    // Edit inputs
    const industryInput = screen.getByDisplayValue('Technology');
    fireEvent.change(industryInput, { target: { value: 'Updated Tech' } });

    // Save changes
    const saveButton = screen.getByTitle('Save Changes');
    fireEvent.click(saveButton);

    // Wait for specific error message
    await waitFor(() => {
      expect(screen.getByText(/Specific update error/i)).toBeInTheDocument();
    });

    // Verify that editing state is reset
    expect(screen.queryByTitle('Save Changes')).not.toBeInTheDocument();
  });

});