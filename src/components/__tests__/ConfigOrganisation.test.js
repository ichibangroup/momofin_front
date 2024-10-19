// ConfigOrganisation.test.js
import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter as Router, MemoryRouter, Route, Routes} from 'react-router-dom';
import ConfigOrganisation from '../ConfigOrganisation';
import api from "../../utils/api";
import ViewOrganisationUsers from "../ViewOrganisationUsers";
import userEvent from "@testing-library/user-event";

jest.mock('../../utils/api');

const mockOrganisation = {
  name: 'ICHIBAN GROUP',
  industry: 'Medicine',
  address: '25 Plainsboro Rd, Princeton, NJ 08540, United States',
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

    expect(api.put).toHaveBeenCalledWith('/api/organizations/123',  {"address": "123 New Address", "description": "New Description", "industry": "Tech", "mainAdmin": "", "name": "New Group Name"});
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
    renderWithRouter()

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/organizations/123');

      const cancelButton = screen.getByText(/CANCEL/i);
      const saveButton = screen.getByText(/SAVE/i);

      expect(cancelButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
      fireEvent.click(cancelButton);


    });
  });
});
