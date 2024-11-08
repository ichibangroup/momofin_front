import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentVersionModal from '../DocumentVersionModal';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Mock data for testing
const mockVersions = [
    {
        id: { version: 1 },
        fileName: 'document_v1.pdf',
        editedBy: { username: 'john.doe' },
        createdDate: '2024-01-01'
    },
    {
        id: { version: 2 },
        fileName: 'document_v2.pdf',
        editedBy: { username: 'jane.smith' },
        createdDate: '2024-01-02'
    }
];

describe('DocumentVersionModal', () => {
    const mockDocumentId = '123';
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

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
            expect(screen.getByText('john.doe')).toBeInTheDocument();
            expect(screen.getByText('jane.smith')).toBeInTheDocument();
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
});