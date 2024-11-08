import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewEditRequests from '../ViewEditRequests';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Mock data for testing
const mockRequests = [
    {
        documentId: '1',
        organizationName: 'Test Org',
        username: 'John Doe',
        position: 'Manager',
        email: 'john@test.com',
        documentName: 'Test Doc'
    },
    {
        documentId: '2',
        organizationName: 'Another Org',
        username: 'Jane Smith',
        position: 'Developer',
        email: 'jane@test.com',
        documentName: 'Another Doc'
    }
];

// Wrapper component for Router
const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('ViewEditRequests Component', () => {
    beforeEach(() => {
        // Clear mock calls between tests
        jest.clearAllMocks();
    });

    test('renders component with header', () => {
        renderWithRouter(<ViewEditRequests />);
        expect(screen.getByText('View All Users')).toBeInTheDocument();
    });

    test('renders table headers correctly', () => {
        renderWithRouter(<ViewEditRequests />);
        expect(screen.getByText('Organisation')).toBeInTheDocument();
        expect(screen.getByText("Owner's Name")).toBeInTheDocument();
        expect(screen.getByText("Owner's Position")).toBeInTheDocument();
        expect(screen.getByText("Owner's Email")).toBeInTheDocument();
        expect(screen.getByText('Document')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('fetches and displays requests successfully', async () => {
        // Mock successful API response
        api.get.mockResolvedValueOnce({ data: mockRequests });

        renderWithRouter(<ViewEditRequests />);

        // Wait for data to load and verify it's displayed
        await waitFor(() => {
            expect(screen.getByText('Test Org')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Another Org')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Verify API was called correctly
        expect(api.get).toHaveBeenCalledWith('/doc/edit-request');
        expect(api.get).toHaveBeenCalledTimes(1);
    });

    test('handles API error correctly', async () => {
        // Mock API error
        const errorMessage = 'Failed to fetch requests. Please try again later.';
        api.get.mockRejectedValueOnce(new Error('API Error'));

        renderWithRouter(<ViewEditRequests />);

        // Check if error is handled
        await waitFor(() => {
            expect(console.error).toHaveBeenCalled;
        });
    });

    test('renders edit and delete buttons for each request', async () => {
        api.get.mockResolvedValueOnce({ data: mockRequests });

        renderWithRouter(<ViewEditRequests />);

        await waitFor(() => {
            // Check if buttons are rendered for each row
            const editButtons = screen.getAllByText('✏️');
            const deleteButtons = screen.getAllByText('❌');

            expect(editButtons).toHaveLength(mockRequests.length);
            expect(deleteButtons).toHaveLength(mockRequests.length);
        });
    });

    test('edit button links to correct route', async () => {
        api.get.mockResolvedValueOnce({ data: mockRequests });

        renderWithRouter(<ViewEditRequests />);

        await waitFor(() => {
            const editLinks = screen.getAllByRole('link');
            expect(editLinks[0].getAttribute('href')).toBe('/app/editDocument/1');
            expect(editLinks[1].getAttribute('href')).toBe('/app/editDocument/2');
        });
    });

    test('renders with empty requests array', async () => {
        api.get.mockResolvedValueOnce({ data: [] });

        renderWithRouter(<ViewEditRequests />);

        await waitFor(() => {
            // Verify headers are still shown even with no data
            expect(screen.getByText('Organisation')).toBeInTheDocument();
            // Verify no user rows are rendered
            expect(screen.queryByRole('user-row')).not.toBeInTheDocument();
        });
    });

    test('data-testid is correctly set', () => {
        renderWithRouter(<ViewEditRequests />);
        expect(screen.getByTestId('viewUsers-1')).toBeInTheDocument();
    });
});