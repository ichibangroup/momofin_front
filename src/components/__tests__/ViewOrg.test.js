import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewOrganisations from '../ViewOrg';
import api from '../../utils/api';
import { BrowserRouter as Router } from 'react-router-dom';


jest.mock('../../utils/api', () => ({
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }));

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  test('sortData maintains stability when values are equal', async () => {
    jest.setTimeout(10000); // Extend timeout for this test

    // Mock organizations with identical "industry" values
    const mockOrganizations = [
      { organizationId: 1, name: 'Org A', industry: 'Tech', location: 'City A', description: 'Desc A' },
      { organizationId: 2, name: 'Org B', industry: 'Tech', location: 'City B', description: 'Desc B' },
    ];
    
    api.get.mockResolvedValue({ data: mockOrganizations });

    render(
      <Router>
        <ViewOrganisations />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });

    // Assuming sortData is triggered by clicking a column header
    const industryHeader = screen.getByText('Industry');
    fireEvent.click(industryHeader);

    // Verify that sort stability is maintained (original order preserved for equal values)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Org A');
    expect(rows[2]).toHaveTextContent('Org B');
  });

  test('shows warning message when attempting to edit multiple organizations simultaneously', async () => {
    api.get.mockResolvedValue({ data: mockOrganizations });
  
    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );
  
    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /edit organisation/i })).toHaveLength(2);
    });
  
    // Get edit buttons
    const editButtons = screen.getAllByRole('button', { name: /edit organisation/i });
  
    // Click first edit button
    fireEvent.click(editButtons[0]);
  
    // Try to click second edit button
    fireEvent.click(editButtons[1]);
  
    // Check for warning message
    const warningMessage = await screen.findByText(/Another edit operation is in progress. Please wait./i);
    expect(warningMessage).toBeInTheDocument();
  });
  
  test('prevents multiple simultaneous edit operations', async () => {
    api.get.mockResolvedValue({ data: mockOrganizations });
  
    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );
  
    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /edit organisation/i })).toHaveLength(2);
    });
  
    // Get edit buttons
    const editButtons = screen.getAllByRole('button', { name: /edit organisation/i });
  
    // Click first edit button
    fireEvent.click(editButtons[0]);
  
    // Check that first org is in edit mode
    const editInputs = screen.getAllByRole('textbox');
    expect(editInputs).toHaveLength(3); // industry, location, description inputs
  
    // Try to click second edit button
    fireEvent.click(editButtons[1]);
  
    // Verify that second org is not in edit mode
    expect(screen.getAllByRole('textbox')).toHaveLength(3); // Still only the first org's inputs
  });

  test('renders organizations and handles loading state', async () => {
    api.get.mockResolvedValue({ data: mockOrganizations });

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
      expect(screen.getByText('Org B')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');
  });

  test('Cancel button hides the delete dialog', async () => {
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

    // Open delete dialog
    const deleteButtons = screen.getAllByTitle(/Delete Organisation/i);
    fireEvent.click(deleteButtons[0]);

    // Ensure the dialog appears
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    // Click the Cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    // Confirm the dialog is no longer visible
    await waitFor(() => {
      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument();
    });
  });
  
  test('should handle API delete failure and revert UI changes', async () => {
    // Simulate a delete failure
    api.delete.mockRejectedValue(new Error('Delete failed'));
    api.get.mockResolvedValue({ data: mockOrganizations }); // For refetching after error

    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );

    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });

    // Find and click the delete button for the first organization
    const deleteButtons = screen.getAllByTitle('Delete Organisation');
    fireEvent.click(deleteButtons[0]);

    // Confirm delete in the modal
    const confirmDeleteButton = screen.getByText('Delete');
    fireEvent.click(confirmDeleteButton);

    // Verify error message is displayed
    await waitFor(() => {
      const errorMessage = screen.getByText('Failed to delete organization');
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify the organization is still in the document (via refetching)
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });

    // Verify delete API was called
    expect(api.delete).toHaveBeenCalledWith('/api/momofin-admin/organizations/1');
    
    // Verify refetch was called after delete failure
    expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');
  });

  test('Location input updates correctly during edit', async () => {
    // Mock the API response for fetching organizations
    api.get.mockResolvedValueOnce({ data: mockOrganizations });
  
    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );
  
    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });
  
    // Click edit button
    const editButtons = screen.getAllByTitle('Edit Organisation');
    fireEvent.click(editButtons[0]);
  
    // Find location input and change its value
    const locationInput = screen.getByDisplayValue('New York');
    fireEvent.change(locationInput, { target: { value: 'Los Angeles' } });
  
    // Verify the input value has changed
    expect(locationInput).toHaveValue('Los Angeles');
  });
  
  test('Description input updates correctly during edit', async () => {
    // Mock the API call to return mock organizations
    api.get.mockResolvedValueOnce({ data: mockOrganizations });
  
    render(
      <MemoryRouter>
        <ViewOrganisations />
      </MemoryRouter>
    );
  
    // Wait for organizations to load
    await waitFor(() => {
      expect(screen.getByText('Org A')).toBeInTheDocument();
    });
  
    // Click edit button
    const editButtons = screen.getAllByTitle('Edit Organisation');
    fireEvent.click(editButtons[0]);
  
    // Find description input and change its value
    const descriptionInput = screen.getByDisplayValue('Tech company');
    fireEvent.change(descriptionInput, { target: { value: 'Updated tech description' } });
  
    // Verify the input value has changed
    expect(descriptionInput).toHaveValue('Updated tech description');
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Save button triggers update API call', async () => {
  // Mock successful API response for GET
  api.get.mockResolvedValue({ data: mockOrganizations });

  // Mock successful API response for PUT
  api.put.mockResolvedValue({
    data: {
      ...mockOrganizations[0],
      location: 'Los Angeles',
      description: 'Updated tech description',
    },
  });

  render(
    <MemoryRouter>
      <ViewOrganisations />
    </MemoryRouter>
  );

  // Wait for organizations to load
  const orgElement = await screen.findByText('Org A');
  expect(orgElement).toBeInTheDocument();

  // Click edit button
  const editButtons = screen.getAllByTitle('Edit Organisation');
  fireEvent.click(editButtons[0]);

  // Change location and description
  const locationInput = screen.getByDisplayValue('New York');
  const descriptionInput = screen.getByDisplayValue('Tech company');
  fireEvent.change(locationInput, { target: { value: 'Los Angeles' } });
  fireEvent.change(descriptionInput, { target: { value: 'Updated tech description' } });

  // Click save button
  const saveButton = screen.getByTitle('Save Changes');
  fireEvent.click(saveButton);

  // Verify API call was made with correct parameters
  await waitFor(() => {
    expect(api.put).toHaveBeenCalledWith(
      '/api/momofin-admin/organizations/1',
      expect.objectContaining({
        name: 'Org A',
        location: 'Los Angeles',
        description: 'Updated tech description',
      })
    );
  });
});


test('Cancel button stops editing without saving', async () => {
    // Mock successful API response for GET
    api.get.mockResolvedValue({ data: mockOrganizations });

    // Mock successful API response for PUT
    api.put.mockResolvedValue({
      data: {
        ...mockOrganizations[0],
        location: 'Los Angeles',
        description: 'Updated tech description',
      },
    });
    
  render(
    <MemoryRouter>
      <ViewOrganisations />
    </MemoryRouter>
  );

  // Wait for organizations to load and check for Org A
  await waitFor(() => {
    expect(screen.getByText(/Org A/i)).toBeInTheDocument();
  });

  // Click edit button
  const editButtons = screen.getAllByTitle('Edit Organisation');
  fireEvent.click(editButtons[0]);

  // Change location and description
  const locationInput = screen.getByDisplayValue('New York');
  const descriptionInput = screen.getByDisplayValue('Tech company');
  
  fireEvent.change(locationInput, { target: { value: 'Los Angeles' } });
  fireEvent.change(descriptionInput, { target: { value: 'Updated tech description' } });

  // Click cancel button
  const cancelButton = screen.getByTitle('Cancel Edit');
  fireEvent.click(cancelButton);

  // Wait for the changes to be reverted and verify we're out of edit mode
  await waitFor(() => {
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Tech company')).toBeInTheDocument();
  });

  // Verify no API call was made
  expect(api.put).not.toHaveBeenCalled();
});


});