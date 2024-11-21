import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import AddOrganisation from '../AddNewOrganisation';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

jest.mock('../../utils/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('AddOrganisation Component', () => {
  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  test('renders Add Organisation form for organisation details', () => {
    renderWithRouter(<AddOrganisation/>);
    expect(screen.getByRole('heading', {name: 'Add Organisation'})).toBeInTheDocument();
    expect(screen.getByLabelText('Organisation Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Industry:')).toBeInTheDocument();
    expect(screen.getByLabelText('Address:')).toBeInTheDocument();
    expect(screen.getByLabelText('Description:')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Continue'})).toBeInTheDocument();
  });

  test('submits organisation details and proceeds to admin details form', async () => {
    renderWithRouter(<AddOrganisation/>);
    fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
    fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
    fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
    fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});

    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    await waitFor(() => expect(screen.getByRole('heading', {name: 'Input Admin Details'})).toBeInTheDocument());
    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Add Organisation'})).toBeInTheDocument();
  });

  test('submits both organisation and admin details', async () => {
    api.post.mockResolvedValueOnce({status: 200});

    renderWithRouter(<AddOrganisation/>);
    // Submit organisation details
    fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
    fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
    fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
    fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    // Submit admin details
    fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
    fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});
    fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    expect(api.post).toHaveBeenCalledWith('/api/momofin-admin/organizations', {
      name: 'TestOrg',
      industry: 'Technology',
      location: '123 Main St',
      description: 'An example organisation',
      adminUsername: 'adminUser',
      adminPassword: 'adminPass',
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app/viewOrg');
    });
  });

  test('displays error message on API error during admin details submission', async () => {
    api.post.mockRejectedValueOnce({response: {data: {message: 'Error creating organization'}}});

    renderWithRouter(<AddOrganisation/>);
    // Submit organisation details
    fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
    fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
    fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
    fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    // Submit admin details
    fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
    fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});
    fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

    expect(await screen.findByText('Error creating organization')).toBeInTheDocument();
  });

  test('handles cancel button click during organization details entry', () => {
    const mockNavigate = useNavigate(); // Mocked navigate function

    // Render the AddOrganisation component
    render(<AddOrganisation />);

    // Fill in some details
    fireEvent.change(screen.getByLabelText('Organisation Name:'), { target: { value: 'TestOrg' } });
    fireEvent.change(screen.getByLabelText('Industry:'), { target: { value: 'Technology' } });

    // Click the Cancel button
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    // Verify that the navigation happens as expected
    expect(mockNavigate).toHaveBeenCalledWith('/app/viewOrg');
  });

  test('handles back button click during admin details entry', async () => {
    renderWithRouter(<AddOrganisation/>);

    // Submit organization details
    fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
    fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
    fireEvent.change(screen.getByLabelText('Address:'), {target: {value: '123 Main St'}});
    fireEvent.change(screen.getByLabelText('Description:'), {target: {value: 'An example organisation'}});
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    // Verify admin form is displayed
    await waitFor(() => {
      expect(screen.getByRole('heading', {name: 'Input Admin Details'})).toBeInTheDocument();
      expect(screen.getByLabelText('Username:')).toBeInTheDocument();
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    });

    // Fill admin details
    fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
    fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});

    // Click the Back button
    fireEvent.click(screen.getByRole('button', {name: 'Back'}));

    // Verify the form switches back to organisation details
    expect(screen.getByRole('heading', {name: 'Add Organisation'})).toBeInTheDocument();
    expect(screen.getByLabelText('Organisation Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Industry:')).toBeInTheDocument();

    // Ensure admin fields are not visible
    expect(screen.queryByLabelText('Username:')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Password:')).not.toBeInTheDocument();
  });


  test('displays loading state during admin details submission', async () => {
    api.post.mockResolvedValueOnce({status: 200});

    renderWithRouter(<AddOrganisation/>);

    // Submit organization details
    fireEvent.change(screen.getByLabelText('Organisation Name:'), {target: {value: 'TestOrg'}});
    fireEvent.change(screen.getByLabelText('Industry:'), {target: {value: 'Technology'}});
    fireEvent.click(screen.getByRole('button', {name: 'Continue'}));

    // Fill admin details and submit
    fireEvent.change(screen.getByLabelText('Username:'), {target: {value: 'adminUser'}});
    fireEvent.change(screen.getByLabelText('Password:'), {target: {value: 'adminPass'}});
    fireEvent.click(screen.getByRole('button', {name: 'Add Organisation'}));

    // Verify loading state
    expect(screen.getByRole('button', {name: 'Submitting...'})).toBeDisabled();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app/viewOrg');
    });
  });
});
