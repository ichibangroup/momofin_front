import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewOrganisation from '../viewOrganisation';
import { BrowserRouter } from 'react-router-dom'; // Needed for useNavigate
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockOrganizations = [
  {
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
];

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockOrganizations),
  })
);

describe('ViewOrganisation component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
  });

  test('renders ViewOrganisation component correctly', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    // Check if the title renders
    expect(screen.getByText('View Organizations')).toBeInTheDocument();

    // Ensure the fetch is called once
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Check if organization data is rendered correctly
    await waitFor(() => {
      expect(screen.getByText('Organization 1')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, City, State, Country')).toBeInTheDocument();
      expect(screen.getByText('This is a long description about Organization 1. It provides technology solutions.')).toBeInTheDocument();

      expect(screen.getByText('Organization 2')).toBeInTheDocument();
      expect(screen.getByText('Healthcare')).toBeInTheDocument();
      expect(screen.getByText('456 Oak St, City, State, Country')).toBeInTheDocument();
      expect(screen.getByText('This is a shorter description for Organization 2.')).toBeInTheDocument();
    });

    // Check for actions buttons
    expect(screen.getAllByText('EDIT')).toHaveLength(2);
    expect(screen.getAllByText('DELETE')).toHaveLength(2);

    // Check for the Add Organisation button
    expect(screen.getByText('Add Organisation')).toBeInTheDocument();
  });

  test('navigates back when clicking "Back" button', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    // Check that the navigate function was called with -1
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('navigates to Add Organisation page when clicking "Add Organisation"', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    const addButton = screen.getByText('Add Organisation');
    fireEvent.click(addButton);

    // Check that the navigate function was called with the correct path
    expect(mockNavigate).toHaveBeenCalledWith('/app/momofinDashboard/addNewOrganisation');
  });

  test('clicking the edit button', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    // Wait for organization data to render
    await waitFor(() => {
      expect(screen.getByText('EDIT')).toBeInTheDocument();
    });

    const editButton = screen.getAllByText('EDIT')[0];
    fireEvent.click(editButton);

    // Ensure the edit button is clickable (no specific action in this test)
    expect(editButton).toBeEnabled();
  });

  test('clicking the delete button', async () => {
    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    // Wait for organization data to render
    await waitFor(() => {
      expect(screen.getByText('DELETE')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('DELETE')[0];
    fireEvent.click(deleteButton);

    // Ensure the delete button is clickable (no specific action in this test)
    expect(deleteButton).toBeEnabled();
  });

  test('handles fetch failure gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject('API error'));

    render(
      <BrowserRouter>
        <ViewOrganisation />
      </BrowserRouter>
    );

    // Ensure fetch was called once
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Since no error handling UI is implemented, we only check if the table is still rendered
    expect(screen.getByTestId('viewOrg-1')).toBeInTheDocument();
  });
});
