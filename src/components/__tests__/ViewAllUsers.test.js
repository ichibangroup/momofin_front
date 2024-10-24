import React from 'react';
import { render, screen } from '@testing-library/react';
import ViewUsers from '../ViewAllUsers'; // Adjust the import path as necessary

describe('ViewUsers Component', () => {
    test('renders without crashing', () => {
        render(<ViewUsers />);
        expect(screen.getByText('View All Users')).toBeInTheDocument();
    });

    test('displays headers correctly', () => {
        render(<ViewUsers />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Organisation')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('has functional add users button', () => {
        render(<ViewUsers />);
        expect(screen.getByText('ADD USERS')).toBeInTheDocument();
    });
});
