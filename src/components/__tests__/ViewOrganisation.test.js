import React from 'react';
import { render, screen } from '@testing-library/react';
import ViewOrganisation from '../viewOrganisation';

describe('ViewOrganisation Component', () => {
  test('should render view organisation component', () => {
    render(<ViewOrganisation />);

    const viewOrgElements = screen.getAllByTestId('viewOrg-1');
    expect(viewOrgElements.length).toBeGreaterThan(0);
    
    const viewOrgElement = viewOrgElements[0];
    expect(viewOrgElement).toBeInTheDocument();
    expect(viewOrgElement).toHaveClass('view-organisation');

    const titleElement = screen.getByText('View Organisation');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName).toBe('H1');
    expect(titleElement).toHaveClass('title');

    expect(viewOrgElement).toContainElement(titleElement);
  });
});