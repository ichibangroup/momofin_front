import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ViewEditRequests from '../ViewEditRequests';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Mock data for testing
const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;
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
        expect(screen.getByText('View Edit Requests')).toBeInTheDocument();
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
            const editButtons = screen.getAllByText('✏️ Accept');
            const deleteButtons = screen.getAllByText('❌ Reject');

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

    describe('handleViewDocument', () => {
        it('should open document in new tab when view button is clicked', async () => {
            // Mock successful document URL fetch
            api.get.mockImplementation((url) => {
                if (url === '/doc/edit-request') {
                    return Promise.resolve({ data: mockRequests });
                }
                if (url.startsWith('/doc/edit-request/1')) {
                    return Promise.resolve({ data: { url: 'https://example.com/doc' } });
                }
                return Promise.reject(new Error('Not found'));
            });

            renderWithRouter(<ViewEditRequests />);

            // Wait for requests to load
            await waitFor(() => {
                expect(screen.getAllByText('View')).toHaveLength(2);
            });

            // Click the first view button
            const viewButtons = screen.getAllByText('View');
            await userEvent.click(viewButtons[0]);

            // Verify API call
            expect(api.get).toHaveBeenCalledWith('/doc/edit-request/1', {
                params: {
                    organizationName: 'Test Org'
                }
            });

            // Verify window.open call
            await waitFor(() => {
                expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/doc', '_blank');
            });
        });

        it('should handle view document error with specific error message', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Mock failed document URL fetch
            api.get.mockImplementation((url) => {
                if (url === '/doc/edit-request') {
                    return Promise.resolve({ data: mockRequests });
                }
                if (url.startsWith('/doc/edit-request/doc123')) {
                    return Promise.reject({
                        response: {
                            data: {
                                message: 'Document not found'
                            }
                        }
                    });
                }
                return Promise.reject(new Error('Not found'));
            });

            renderWithRouter(<ViewEditRequests />);

            // Wait for requests to load
            await waitFor(() => {
                expect(screen.getAllByText('View')).toHaveLength(2);
            });

            // Click the first view button
            const viewButtons = screen.getAllByText('View');
            await userEvent.click(viewButtons[0]);

            // Verify error handling
            expect(consoleSpy).toHaveBeenCalled();
            expect(mockWindowOpen).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle view document error with unknown error', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // Mock failed document URL fetch with generic error
            api.get.mockImplementation((url) => {
                if (url === '/doc/edit-request') {
                    return Promise.resolve({ data: mockRequests });
                }
                if (url.startsWith('/doc/edit-request/doc123')) {
                    return Promise.reject(new Error());
                }
                return Promise.reject(new Error('Not found'));
            });

            renderWithRouter(<ViewEditRequests />);

            // Wait for requests to load
            await waitFor(() => {
                expect(screen.getAllByText('View')).toHaveLength(2);
            });

            // Click the first view button
            const viewButtons = screen.getAllByText('View');
            await userEvent.click(viewButtons[0]);

            // Verify error handling
            expect(consoleSpy).toHaveBeenCalled();
            expect(mockWindowOpen).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should disable view button while loading', async () => {
            // Mock slow document URL fetch
            api.get.mockImplementation((url) => {
                if (url === '/doc/edit-request') {
                    return Promise.resolve({ data: mockRequests });
                }
                if (url.startsWith('/doc/edit-request/doc123')) {
                    return new Promise(resolve =>
                        setTimeout(() =>
                            resolve({ data: { url: 'https://example.com/doc' } }), 100
                        )
                    );
                }
                return Promise.reject(new Error('Not found'));
            });

            renderWithRouter(<ViewEditRequests />);

            // Wait for requests to load
            await waitFor(() => {
                expect(screen.getAllByText('View')).toHaveLength(2);
            });

            // Click the first view button
            const viewButtons = screen.getAllByText('View');
            await userEvent.click(viewButtons[0]);

            // Verify button is disabled during loading
            expect(viewButtons[0]).toBeDisabled();

            // Wait for loading to complete
            await waitFor(() => {
                expect(viewButtons[0]).not.toBeDisabled();
            });
        });
    });

    describe('View Button Accessibility', () => {
        it('should have accessible elements for view button', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/doc/edit-request') {
                    return Promise.resolve({ data: mockRequests });
                }
                if (url.startsWith('/doc/edit-request/doc123')) {
                    return Promise.reject({
                        response: {
                            data: {
                                message: 'Document not found'
                            }
                        }
                    });
                }
                return Promise.reject(new Error('Not found'));
            });

            renderWithRouter(<ViewEditRequests />);

            await waitFor(() => {
                const viewButtons = screen.getAllByText('View');
                viewButtons.forEach(button => {
                    expect(button).toHaveClass('px-3', 'py-2', 'text-sm', 'rounded-md');
                    expect(button).toBeEnabled();
                });
            });
        });
    });
    describe('ViewEditRequests - Reject Request', () => {

        beforeEach(() => {
            // Reset the mock before each test
            api.get.mockClear();
            api.delete.mockClear();
            api.get.mockImplementation((url) => {
                if (url === '/doc/edit-request') {
                    return Promise.resolve({ data: mockRequests });
                }
                if (url.startsWith('/doc/edit-request/doc123')) {
                    return new Promise(resolve =>
                        setTimeout(() =>
                            resolve({ data: { url: 'https://example.com/doc' } }), 100
                        )
                    );
                }
                return Promise.reject(new Error('Not found'));
            });
        });

        test('renders cancel edit request button when document is being requested', async () => {
            renderWithRouter(<ViewEditRequests />);

            // Wait for documents to load
            await waitFor(() => {
                const cancelButtons = screen.getAllByText('❌ Reject');
                expect(cancelButtons).toHaveLength(2);
            });
        });

        test('successfully cancels an edit request', async () => {
            // Mock the get request to return mock documents

            // Mock the delete request to succeed
            api.delete.mockResolvedValueOnce({});

            renderWithRouter(<ViewEditRequests />);

            // Wait for documents to load
            await waitFor(() => {
                const cancelButtons = screen.getAllByText('❌ Reject');
                expect(cancelButtons).toHaveLength(2);
            });


            const cancelButtons = screen.getAllByText('❌ Reject');
            fireEvent.click(cancelButtons[0]);

            // Verify the delete endpoint was called with correct documentId
            await waitFor(() => {
                expect(api.delete).toHaveBeenCalledWith('/doc/edit-request/1');
            });
        });

        test('handles cancel edit request error', async () => {
            // Mock the get request to return mock documents

            // Mock the delete request to fail
            api.delete.mockRejectedValueOnce(new Error('Cancellation failed'));

            // Spy on console.error to check error logging
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            renderWithRouter(<ViewEditRequests />);

            // Wait for documents to load
            await waitFor(() => {
                const cancelButtons = screen.getAllByText('❌ Reject');
                expect(cancelButtons).toHaveLength(2);
            });

            // Click the Cancel Edit Request button
            const cancelButtons = screen.getAllByText('❌ Reject');
            fireEvent.click(cancelButtons[0]);

            // Verify error handling
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Error rejecting request:', expect.any(Error));
            });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });
});