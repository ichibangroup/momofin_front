import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigOrganisation from '../ConfigOrganisation';

describe('ConfigOrganisation Component', () => {
  test('renders ConfigOrganisation component', () => {
    render(<ConfigOrganisation />);
    const configOrganisationElement = screen.getByTestId('config-organisation');
    expect(configOrganisationElement).toBeInTheDocument();
  });

  test('displays the correct title', () => {
    render(<ConfigOrganisation />);
    const titleElement = screen.getByText('Configure Organisation');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('title');
  });

  test('displays the description', () => {
    render(<ConfigOrganisation />);
    const descriptionElement = screen.getByText('Configure your organisation settings here.');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveClass('description');
  });

  test('renders the settings form', () => {
    render(<ConfigOrganisation />);
    const formElement = screen.getByTestId('settings-form');
    expect(formElement).toBeInTheDocument();
  });

  test('displays the save button', () => {
    render(<ConfigOrganisation />);
    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('type', 'submit');
  });
});