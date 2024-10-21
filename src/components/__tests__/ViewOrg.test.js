import React from 'react';
import { render, screen } from '@testing-library/react';
import ViewOrganisations from '../ViewOrg'; 

describe('ViewOrganisations Component', () => {
    beforeEach(() => {
        render(<ViewOrganisations />);
    });

    test('renders without crashing', () => {
        expect(screen.getByText('View All Organisations')).toBeInTheDocument();
    });

    test('renders all headers', () => {
        const headers = ['Logo', 'Name', 'Industry', 'Address', 'Description', 'Actions'];
        headers.forEach(header => {
            expect(screen.getByText(header)).toBeInTheDocument();
        });
    });

    test('has add organisation button', () => {
        const addButton = screen.getByText('ADD ORGANISATION');
        expect(addButton).toBeInTheDocument();
        expect(addButton.tagName).toBe('BUTTON'); // Ensures it's a button and clickable
    });
});
