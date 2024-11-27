// ConfigOrganisation.test.js
import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter as Router, MemoryRouter, Route, Routes, useParams} from 'react-router-dom';
import ConfigOrganisation from '../ConfigOrganisation';
import api from "../../utils/api";
import userEvent from "@testing-library/user-event";

jest.mock('../../utils/api');
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn()
}));

const mockOrganisation = {
  name: 'ICHIBAN GROUP',
  industry: 'Medicine',
  location: '25 Plainsboro Rd, Princeton, NJ 08540, United States',
  description: '',
  mainAdmin: '',
}

const renderWithRouter = (organizationId = '123') => {

  return render(
      <MemoryRouter initialEntries={[`/app/configOrganisation/${organizationId}`]}>
        <Routes>
          <Route
              path="/app/configOrganisation/:id"
              element={<ConfigOrganisation />}
          />
        </Routes>
      </MemoryRouter>
  );
};
describe('ConfigOrganisation component',  () => {
  beforeEach( () => {
    jest.mocked(useParams).mockReturnValue({ id: '123' });
    api.get.mockResolvedValue({
      data: mockOrganisation,
      status: 200
    });
  });

  test('renders ConfigOrganisation component', async () => {
    renderWithRouter()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
      const configElement = screen.getByTestId('config-organisation');
      expect(configElement).toBeInTheDocument();
    });
  });

  test('displays default values for form inputs', async () => {
    renderWithRouter()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');

      const nameInput = screen.getByLabelText(/NAME/i);
      const industryInput = screen.getByLabelText(/INDUSTRY/i);
      const addressInput = screen.getByLabelText(/ADDRESS/i);
      const descriptionInput = screen.getByLabelText(/DESCRIPTION/i);

      expect(nameInput.value).toBe('ICHIBAN GROUP');
      expect(industryInput.value).toBe('Medicine');
      expect(addressInput.value).toBe('25 Plainsboro Rd, Princeton, NJ 08540, United States');
      expect(descriptionInput.value).toBe('');
    });
  });

  test('updates input fields on change', async () => {
    api.put.mockResolvedValueOnce({ status: 200, data: { message: 'Organization updated' } });
    renderWithRouter()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
      const saveButton = screen.getByText(/SAVE/i);

      const nameInput = screen.getByLabelText(/NAME/i);
      const industryInput = screen.getByLabelText(/INDUSTRY/i);
      const addressInput = screen.getByLabelText(/ADDRESS/i);
      const descriptionInput = screen.getByLabelText(/DESCRIPTION/i);

      fireEvent.change(nameInput, { target: { value: 'New Group Name' } });
      fireEvent.change(industryInput, { target: { value: 'Tech' } });
      fireEvent.change(addressInput, { target: { value: '123 New Address' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
      fireEvent.click(saveButton);

      expect(nameInput.value).toBe('New Group Name');
      expect(industryInput.value).toBe('Tech');
      expect(addressInput.value).toBe('123 New Address');
      expect(descriptionInput.value).toBe('New Description');
    });

    expect(api.put).toHaveBeenCalledWith('/api/organizations/123',  {"location": "123 New Address", "description": "New Description", "industry": "Tech", "mainAdmin": "", "name": "New Group Name"});
  });

  test('renders the ADD USER and VIEW ORG USERS LIST links', async () => {
    renderWithRouter()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');

      const addUserLink = screen.getByText(/ADD USER/i);
      const viewUsersLink = screen.getByText(/VIEW ORG USERS LIST/i);

      expect(addUserLink).toBeInTheDocument();
      expect(viewUsersLink).toBeInTheDocument();
    });
  });

  test('renders the CANCEL and SAVE buttons', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');

      const cancelButton = screen.getByText(/CANCEL/i);
      const saveButton = screen.getByText(/SAVE/i);

      expect(cancelButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
      fireEvent.click(cancelButton);


    });
  });

  describe('Fetch Organization Errors', () => {
    it('should display error message when fetching organization fails', async () => {
      // Mock the API call to fail
      api.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter();

      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch organization details')).toBeInTheDocument();
      });

      // Verify the API was called with correct parameters
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
    });

    it('should handle API errors with specific error responses', async () => {
      // Mock API call with a 404 response
      api.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Organization not found' }
        }
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch organization details')).toBeInTheDocument();
      });
    });
  });

  describe('Update Organization Errors', () => {
    beforeEach(() => {
      // Mock successful initial fetch
      api.get.mockResolvedValueOnce({
        data: {
          name: 'Test Org',
          industry: 'Tech',
          location: '123 Test St',
          description: 'Test Description',
          mainAdmin: 'Admin User'
        }
      });
    });

    it('should display error message when updating organization fails', async () => {
      // Render the component and wait for initial load
      renderWithRouter();

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Test Org')).toBeInTheDocument();
      });

      // Mock the update call to fail
      api.put.mockRejectedValueOnce(new Error('Update failed'));

      // Trigger form submission
      fireEvent.click(screen.getByText('SAVE'));

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Error: Failed to update organization')).toBeInTheDocument();
      });

      // Verify the API was called with correct parameters
      expect(api.put).toHaveBeenCalledWith('/api/organizations/123', expect.any(Object));
    });

    it('should handle network errors during update', async () => {
      renderWithRouter();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Org')).toBeInTheDocument();
      });

      // Mock network error
      api.put.mockRejectedValueOnce(new Error('Network Error'));

      // Try to update
      fireEvent.click(screen.getByText('SAVE'));

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to update organization')).toBeInTheDocument();
      });
    });

    it('should handle API errors with specific status codes during update', async () => {
      renderWithRouter();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Test Org')).toBeInTheDocument();
      });

      // Mock API error response
      api.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'Invalid data' }
        }
      });

      // Try to update
      fireEvent.click(screen.getByText('SAVE'));

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to update organization')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching data', async () => {
      // Create a promise that won't resolve immediately
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      api.get.mockReturnValue(promise);

      renderWithRouter();

      // Verify loading state is shown
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Resolve the promise
      resolvePromise({ data: {
          name: 'Test Org',
          industry: 'Tech',
          location: '123 Test St',
          description: 'Test Description',
          mainAdmin: 'Admin User'
        }});

      // Verify loading state is removed
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  it('should not retrieve organisation if id is undefined', async () => {
    // Mock useParams to return no id
    jest.mocked(useParams).mockReturnValue({ id: undefined });

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    // Verify API was not called
    expect(api.get).not.toHaveBeenCalled();
  });
});

test('displays validation errors when required fields are empty', async () => {
  renderWithRouter();

  // Simulate user submitting the form without filling out the required fields
  fireEvent.click(screen.getByText(/SAVE/i));

  // Check for validation error messages
  await waitFor(() => {
    const nameError = screen.getByText(/Name is required/i);
    const industryError = screen.getByText(/Industry is required/i);
    const addressError = screen.getByText(/Address is required/i);
    expect(nameError).toBeInTheDocument();
    expect(industryError).toBeInTheDocument();
    expect(addressError).toBeInTheDocument();
  });
});

test('submits form with valid data', async () => {
  api.put.mockResolvedValueOnce({ status: 200, data: { message: 'Organization updated' } });

  renderWithRouter();

  // Fill out the form with valid data
  fireEvent.change(screen.getByLabelText(/NAME/i), { target: { value: 'New Group Name' } });
  fireEvent.change(screen.getByLabelText(/INDUSTRY/i), { target: { value: 'Tech' } });
  fireEvent.change(screen.getByLabelText(/ADDRESS/i), { target: { value: '123 New Address' } });
  fireEvent.change(screen.getByLabelText(/DESCRIPTION/i), { target: { value: 'New Description' } });

  // Submit the form
  fireEvent.click(screen.getByText(/SAVE/i));

  // Check if the form was submitted
  await waitFor(() => {
    expect(api.put).toHaveBeenCalledWith('/api/organizations/123', expect.objectContaining({
      name: 'New Group Name',
      industry: 'Tech',
      location: '123 New Address',
      description: 'New Description'
    }));
  });
});

test('shows validation error for invalid email format', async () => {
  renderWithRouter();

  // Input an invalid email
  fireEvent.change(screen.getByLabelText(/EMAIL/i), { target: { value: 'invalid-email' } });

  // Submit the form
  fireEvent.click(screen.getByText(/SAVE/i));

  // Check for validation error for the email field
  await waitFor(() => {
    const emailError = screen.getByText(/Invalid email address/i);
    expect(emailError).toBeInTheDocument();
  });
});

test('shows error for name shorter than minimum length', async () => {
  renderWithRouter();

  // Enter a short name
  fireEvent.change(screen.getByLabelText(/NAME/i), { target: { value: 'AB' } });

  // Submit the form
  fireEvent.click(screen.getByText(/SAVE/i));

  // Check for validation error for the name field
  await waitFor(() => {
    const nameError = screen.getByText(/Name must be at least 3 characters/i);
    expect(nameError).toBeInTheDocument();
  });
});

