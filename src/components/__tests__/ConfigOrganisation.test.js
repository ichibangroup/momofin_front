// ConfigOrganisation.test.js
import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter as Router, MemoryRouter, Route, Routes, useParams} from 'react-router-dom';
import ConfigOrganisation from '../ConfigOrganisation';
import api from '../../utils/api';
import userEvent from '@testing-library/user-event';

jest.mock('../../utils/api');
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
}));

const mockOrganisation = {
  name: 'ICHIBAN GROUP',
  industry: 'Medicine',
  location: '25 Plainsboro Rd, Princeton, NJ 08540, United States',
  description: '',
};

const renderWithRouter = (organizationId = '123') => {
  return render(
      <MemoryRouter initialEntries={[`/app/configOrganisation/${organizationId}`]}>
        <Routes>
          <Route path="/app/configOrganisation/:id" element={<ConfigOrganisation />}/>
        </Routes>
      </MemoryRouter>
  );
};
describe('ConfigOrganisation component',  () => {
  beforeEach( () => {
    jest.mocked(useParams).mockReturnValue({ id: '123' });
    api.get.mockResolvedValue({
      data: mockOrganisation,
      status: 200,
    });
  });

  test('renders ConfigOrganisation component', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
      const configElement = screen.getByTestId('config-organisation');
      expect(configElement).toBeInTheDocument();
    });
  });

  test('displays default values for form inputs', async () => {
    renderWithRouter();

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
    renderWithRouter();

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

    expect(api.put).toHaveBeenCalledWith('/api/organizations/123',  {
      'location': '123 New Address',
      'description': 'New Description',
      'industry': 'Tech',
      'name': 'New Group Name'});
  });

  test('renders the ADD USER and VIEW ORG USERS LIST links', async () => {
    renderWithRouter();

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
      api.get.mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch organization details')).toBeInTheDocument();
      });

      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
    });

    it('should handle API errors with specific error responses', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: { message: 'Organization not found' },
        },
      });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to fetch organization details')).toBeInTheDocument();
      });
    });
  });

  describe('Update Organization Errors', () => {
    beforeEach(() => {
      api.get.mockResolvedValueOnce({
        data: {
          name: 'Test Org',
          industry: 'Tech',
          location: '123 Test St',
          description: 'Test Description',
        },
      });
    });

    it('should display error message when updating organization fails', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Test Org')).toBeInTheDocument();
      });

      api.put.mockRejectedValueOnce(new Error('Update failed'));

      fireEvent.click(screen.getByText('SAVE'));

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to update organization')).toBeInTheDocument();
      });

      expect(api.put).toHaveBeenCalledWith('/api/organizations/123', expect.any(Object));
    });

    it('should handle network errors during update', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Test Org')).toBeInTheDocument();
      });

      api.put.mockRejectedValueOnce(new Error('Network Error'));

      fireEvent.click(screen.getByText('SAVE'));

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to update organization')).toBeInTheDocument();
      });
    });

    it('should handle API errors with specific status codes during update', async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('Test Org')).toBeInTheDocument();
      });

      api.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'Invalid data' },
        },
      });

      fireEvent.click(screen.getByText('SAVE'));

      await waitFor(() => {
        expect(screen.getByText('Error: Failed to update organization')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching data', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      api.get.mockReturnValue(promise);

      renderWithRouter();

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      resolvePromise({
        data: {
          name: 'Test Org',
          industry: 'Tech',
          location: '123 Test St',
          description: 'Test Description',
          mainAdmin: 'Admin User',
        }});

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  it('should not retrieve organisation if id is undefined', async () => {
    jest.mocked(useParams).mockReturnValue({ id: undefined });

    renderWithRouter();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('ConfigOrganisation component - Validation Tests', () => {
  beforeEach(() => {
    jest.mocked(useParams).mockReturnValue({ id: '123' });
    api.get.mockResolvedValue({
      data: mockOrganisation,
      status: 200,
    });
  });

  it('should show error message if name is empty on form submit', async () => {
    renderWithRouter();

    // Wait for the API call to complete and for the 'SAVE' button to be rendered
    const saveButton = await screen.findByRole('button', { name: /save/i });

    const nameInput = screen.getByLabelText(/NAME/i);
    fireEvent.change(nameInput, { target: { value: '' } }); // Empty name
    fireEvent.click(saveButton);

    // Wait for the validation error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument(); // Validation error
    });
  });

  it('should show error message if industry is empty on form submit', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
    });

    const saveButton = await screen.findByRole('button', { name: /save/i });
    const industryInput = screen.getByLabelText(/INDUSTRY/i);

    fireEvent.change(industryInput, { target: { value: '' } }); // Empty industry
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Industry is required/i)).toBeInTheDocument(); // Validation error
    });

    expect(industryInput.value).toBe(''); // Ensure the field remains empty
  });

  it('should show error message if location is empty on form submit', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
    });

    const saveButton = await screen.findByRole('button', { name: /save/i });
    const locationInput = screen.getByLabelText(/ADDRESS/i);

    fireEvent.change(locationInput, { target: { value: '' } }); // Empty location
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Location is required/i)).toBeInTheDocument(); // Validation error
    });

    expect(locationInput.value).toBe(''); // Ensure the field remains empty
  });

  it('should show error message if industry contains invalid characters', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
    });

    const saveButton = await screen.findByRole('button', { name: /save/i });
    const industryInput = screen.getByLabelText(/INDUSTRY/i);

    fireEvent.change(industryInput, { target: { value: 'Medicine123' } }); // Invalid industry
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Industry name must contain only letters and spaces/i)).toBeInTheDocument(); // Validation error
    });

    expect(industryInput.value).toBe('Medicine123'); // Ensure invalid input is retained
  });

  it('should show error message if location contains invalid characters', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
    });

    const saveButton = await screen.findByRole('button', { name: /save/i });
    const locationInput = screen.getByLabelText(/ADDRESS/i);

    fireEvent.change(locationInput, { target: { value: '123 Main St, City!@#' } }); // Invalid location
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Location can only contain letters, numbers, and commas/i)).toBeInTheDocument(); // Validation error
    });

    expect(locationInput.value).toBe('123 Main St, City!@#'); // Ensure invalid input is retained
  });

  it('should not show validation errors if all fields are valid', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');
    });

    const saveButton = await screen.findByRole('button', { name: /save/i });
    const nameInput = screen.getByLabelText(/NAME/i);
    const industryInput = screen.getByLabelText(/INDUSTRY/i);
    const locationInput = screen.getByLabelText(/ADDRESS/i);

    fireEvent.change(nameInput, {target: {value: 'New Org Name'}});
    fireEvent.change(industryInput, {target: {value: 'Tech'}});
    fireEvent.change(locationInput, {target: {value: '456 New Address, City'}});

    fireEvent.click(saveButton);

    await waitFor(() => {
      // No error messages should be shown if inputs are valid
      expect(screen.queryByText(/Name is required/i)).toBeNull();
      expect(screen.queryByText(/Industry is required/i)).toBeNull();
      expect(screen.queryByText(/Location is required/i)).toBeNull();
    });

    expect(api.put).toHaveBeenCalledWith('/api/organizations/123', expect.objectContaining({
      name: 'New Org Name',
      industry: 'Tech',
      location: '456 New Address, City',
    }));
  });
});
