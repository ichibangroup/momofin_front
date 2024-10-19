import React from 'react';
import { render, screen } from '@testing-library/react';
import ViewOrgUsers from '../ViewOrgUsers';

describe('ViewOrgUsers Component', () => {
    test('renders ViewOrgUserscomponent', () => {
        render(<ViewOrgUsers />);
        expect(screen.getByText('View Ichiban Group Users')).toBeInTheDocument();
    });

    test('checks for the presence of add users button', () => {
        render(<ViewOrgUsers />);
        expect(screen.getByText('ADD USERS')).toBeInTheDocument();
    });
});
