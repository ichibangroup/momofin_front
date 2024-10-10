// ConfigOrganisation.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ConfigOrganisation from '../ConfigOrganisation';

describe('ConfigOrganisation component', () => {
  beforeEach(() => {
    render(
      <Router>
        <ConfigOrganisation />
      </Router>
    );
  });

  test('renders ConfigOrganisation component', () => {
    const configElement = screen.getByTestId('config-organisation');
    expect(configElement).toBeInTheDocument();
  });

  test('displays default values for form inputs', () => {
    const nameInput = screen.getByLabelText(/NAME/i);
    const industryInput = screen.getByLabelText(/INDUSTRY/i);
    const addressInput = screen.getByLabelText(/ADDRESS/i);
    const descriptionInput = screen.getByLabelText(/DESCRIPTION/i);

    expect(nameInput.value).toBe('ICHIBAN GROUP');
    expect(industryInput.value).toBe('Medicine');
    expect(addressInput.value).toBe('25 Plainsboro Rd, Princeton, NJ 08540, United States');
    expect(descriptionInput.value).toBe('');
  });

  test('updates input fields on change', () => {
    const nameInput = screen.getByLabelText(/NAME/i);
    const industryInput = screen.getByLabelText(/INDUSTRY/i);
    const addressInput = screen.getByLabelText(/ADDRESS/i);
    const descriptionInput = screen.getByLabelText(/DESCRIPTION/i);

    fireEvent.change(nameInput, { target: { value: 'New Group Name' } });
    fireEvent.change(industryInput, { target: { value: 'Tech' } });
    fireEvent.change(addressInput, { target: { value: '123 New Address' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    expect(nameInput.value).toBe('New Group Name');
    expect(industryInput.value).toBe('Tech');
    expect(addressInput.value).toBe('123 New Address');
    expect(descriptionInput.value).toBe('New Description');
  });

  test('renders the ADD USER and VIEW ORG USERS LIST links', () => {
    const addUserLink = screen.getByText(/ADD USER/i);
    const viewUsersLink = screen.getByText(/VIEW ORG USERS LIST/i);

    expect(addUserLink).toBeInTheDocument();
    expect(viewUsersLink).toBeInTheDocument();
  });

  test('renders the CANCEL and SAVE buttons', () => {
    const cancelButton = screen.getByText(/CANCEL/i);
    const saveButton = screen.getByText(/SAVE/i);

    expect(cancelButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
  });
});
