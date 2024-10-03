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
    
    const titleElement = screen.getByText('Configure Organisation!');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass('title');
  });

  test('displays the description', () => {
    render(<ConfigOrganisation />);
    
    const descriptionElement = screen.getByText('This page will allow you to configure organization settings and manage related features.');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement).toHaveClass('description');
  });

  test('renders the placeholder content', () => {
    render(<ConfigOrganisation />);
    
    const placeholderContent = screen.getByTestId('placeholder-content');
    expect(placeholderContent).toBeInTheDocument();
    expect(placeholderContent).toHaveClass('placeholder-content');
  });

  test('displays the placeholder title', () => {
    render(<ConfigOrganisation />);
    
    const placeholderTitle = screen.getByText('Settings');
    expect(placeholderTitle).toBeInTheDocument();
    expect(placeholderTitle).toHaveClass('placeholder-title');
  });

  test('displays the placeholder description', () => {
    render(<ConfigOrganisation />);
    
    const placeholderDescription = screen.getByText('This section will include various settings for the organization.');
    expect(placeholderDescription).toBeInTheDocument();
  });
});