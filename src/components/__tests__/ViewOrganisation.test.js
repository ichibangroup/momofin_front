import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ViewOrganisation from '../viewOrganisation';

describe('ViewOrganisation Component', () => {
    test('should render view organisation component', () => {
        render(
            <Router>
                <ViewOrganisation />
            </Router>
        );

        const viewOrgElements = screen.getAllByTestId('viewOrg-1');
        expect(viewOrgElements.length).toBeGreaterThan(0);
        
        const viewOrgElement = viewOrgElements[0];
        expect(viewOrgElement).toBeInTheDocument();
        expect(viewOrgElement).toHaveClass('view-organisation');

        const titleElement = screen.getByText('View Organisation');
        expect(titleElement).toBeInTheDocument();
        expect(titleElement.tagName).toBe('H1');
        expect(titleElement).toHaveClass('title');

        // Check if the back button is present
        const backButton = screen.getByText('Back');
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveClass('back-button');

        // Optional: Simulate back button click
        fireEvent.click(backButton);
    });
});
