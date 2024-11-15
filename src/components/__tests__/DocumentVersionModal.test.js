import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentVersionModal from '../DocumentVersionModal';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Mock data for testing
const mockWindowOpen = jest.fn();
window.open = mockWindowOpen;

describe('DocumentVersionModal', () => {
    const mockDocumentId = '123';
    const mockOnClose = jest.fn();

    const mockVersions = [
        {
            id: {
                documentId: 'doc123',
                version: 1
            },
            editedBy: {
                username: 'user1'
            },
            createdDate: '2024-03-15'
        },
        {
            id: {
                documentId: 'doc123',
                version: 2
            },
            editedBy: {
                username: 'user2'
            },
            createdDate: '2024-03-16'
        }
    ];

    const defaultProps = {
        documentId: 'doc123',
        isOpen: true,
        onClose: jest.fn()
    };

    test('renders modal when isOpen is true', () => {
        render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('Document Versions')).toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
    });

    test('fetches and displays document versions', async () => {
        // Mock successful API response
        api.get.mockResolvedValueOnce({ data: mockVersions });

        render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        // Verify API call
        expect(api.get).toHaveBeenCalledWith(`/doc/${mockDocumentId}/versions`);

        // Wait for and verify data display
        await waitFor(() => {
            expect(screen.getByText('user1')).toBeInTheDocument();
            expect(screen.getByText('user2')).toBeInTheDocument();
        });
    });

    test('handles API error gracefully', async () => {
        // Mock console.error to prevent error output in tests
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        // Mock API error
        const error = new Error('Failed to fetch versions');
        api.get.mockRejectedValueOnce(error);

        render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error fetching document versions:',
                error
            );
        });

        consoleSpy.mockRestore();
    });

    test('calls onClose when close button is clicked', () => {
        render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        const closeButton = screen.getByRole('button', { name: /×/i });
        userEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('renders table headers correctly', () => {
        render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(screen.getByText('Version')).toBeInTheDocument();
        expect(screen.getByText('Edited By')).toBeInTheDocument();
        expect(screen.getByText('Created Date')).toBeInTheDocument();
    });

    test('only fetches versions when modal is opened', () => {
        const { rerender } = render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={false}
                onClose={mockOnClose}
            />
        );

        expect(api.get).not.toHaveBeenCalled();

        rerender(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(api.get).toHaveBeenCalledTimes(1);
    });

    test('refetches versions when documentId changes', () => {
        const { rerender } = render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(api.get).toHaveBeenCalledWith(`/doc/${mockDocumentId}/versions`);

        // Rerender with new documentId
        const newDocumentId = '456';
        rerender(
            <DocumentVersionModal
                documentId={newDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(api.get).toHaveBeenCalledWith(`/doc/${newDocumentId}/versions`);
    });

    test('modal backdrop has correct classes', () => {
        const { container, rerender } = render(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={true}
                onClose={mockOnClose}
            />
        );

        expect(container.firstChild).toHaveClass('modal-backdrop', 'show');

        rerender(
            <DocumentVersionModal
                documentId={mockDocumentId}
                isOpen={false}
                onClose={mockOnClose}
            />
        );

        expect(container.firstChild).toHaveClass('modal-backdrop');
        expect(container.firstChild).not.toHaveClass('show');
    });

    describe('handleViewDocument Functionality', () => {
        it('should open document in new tab when view button is clicked', async () => {
            // Mock successful document URL fetch
            api.get.mockImplementation((url) => {
                if (url === '/doc/doc123/versions') {
                    return Promise.resolve({ data: mockVersions });
                }
                if (url === '/doc/view/doc123/1') {
                    return Promise.resolve({ data: { url: 'https://example.com/doc' } });
                }
                return Promise.reject(new Error('Not found'));
            });

            render(<DocumentVersionModal {...defaultProps} />);

            // Wait for versions to load
            await waitFor(() => {
                expect(screen.getAllByText('View')).toHaveLength(2);
            });

            // Click the first view button
            const viewButtons = screen.getAllByText('View');
            await userEvent.click(viewButtons[0]);

            // Verify API call and window.open
            expect(api.get).toHaveBeenCalledWith('/doc/view/doc123/1');
            expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/doc', '_blank');
        });

        it('should handle view document error correctly', async () => {
            // Mock failed document URL fetch
            api.get.mockImplementation((url) => {
                if (url === '/doc/doc123/versions') {
                    return Promise.resolve({ data: mockVersions });
                }
                if (url === '/doc/view/doc123/1') {
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

            render(<DocumentVersionModal {...defaultProps} />);

            // Wait for versions to load
            await waitFor(() => {
                expect(screen.getAllByText('View')).toHaveLength(2);
            });

            // Click the first view button
            const viewButtons = screen.getAllByText('View');
            await userEvent.click(viewButtons[0]);

            // Verify error message
            await waitFor(() => {
                expect(screen.getByText('Failed to load document: Document not found')).toBeInTheDocument();
            });

            // Verify window.open was not called
            expect(mockWindowOpen).not.toHaveBeenCalled();
        });

        it('should handle view document error with unknown error message', async () => {
            // Mock failed document URL fetch with no specific error message
            api.get.mockImplementation((url) => {
                if (url === '/doc/doc123/versions') {
                    return Promise.resolve({ data: mockVersions });
                }
                if (url === '/doc/view/doc123/1') {
                    return Promise.reject(new Error());
                }
                return Promise.reject(new Error('Not found'));
            });

            render(<DocumentVersionModal {...defaultProps} />);

            // Wait for versions to load
            await waitFor(() => {
                expect(screen.getAllByText('View')).toHaveLength(2);
            });

            // Click the first view button
            const viewButtons = screen.getAllByText('View');
            await userEvent.click(viewButtons[0]);

            // Verify error message
            await waitFor(() => {
                expect(screen.getByText('Failed to load document: An unknown error occurred')).toBeInTheDocument();
            });
        });
    });
});