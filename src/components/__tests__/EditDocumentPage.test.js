import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import EditDocumentPage from '../EditDocumentPage';
import api from '../../utils/api';

// Mock the modules
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn()
}));



jest.mock('../../utils/api');

describe('EditDocumentPage', () => {
    // Setup common test variables
    const mockDocumentId = '123';
    const createFile = (size, type = 'application/pdf') => {
        return new File(['a'.repeat(size)], 'test.pdf', { type });
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        useParams.mockReturnValue({ documentId: mockDocumentId });
    });

    test('renders edit document page with all elements', () => {
        render(<EditDocumentPage />);

        expect(screen.getByText('Edit Document')).toBeInTheDocument();

        expect(screen.getByTestId('file-upload-input')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit Edit' })).toBeInTheDocument();
    });

    test('handles valid file selection', () => {
        render(<EditDocumentPage />);

        const file = createFile(1024 * 1024); // 1MB file
        const input = screen.getByTestId('file-upload-input');

        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.queryByText(/File size must be less than/)).not.toBeInTheDocument();
    });

    test('shows error for oversized files', () => {
        render(<EditDocumentPage />);

        const file = createFile(6 * 1024 * 1024); // 6MB file
        const input = screen.getByTestId('file-upload-input');

        fireEvent.change(input, { target: { files: [file] } });

        expect(screen.getByText('File size must be less than 5MB.')).toBeInTheDocument();
    });

    test('handles successful file submission', async () => {
        render(<EditDocumentPage />);

        const file = createFile(1024 * 1024);
        const input = screen.getByTestId('file-upload-input');

        // Mock successful API response
        api.post.mockResolvedValueOnce({ data: { message: 'Success' } });

        // Select file and submit
        fireEvent.change(input, { target: { files: [file] } });
        fireEvent.click(screen.getByRole('button', { name: 'Submit Edit' }));

        // Check loading state
        expect(screen.getByRole('button', { name: 'Submitting...' })).toBeInTheDocument();

        await waitFor(() => {
            // Verify API call
            expect(api.post).toHaveBeenCalledWith(
                `/doc/edit-request/${mockDocumentId}`,
                expect.any(FormData),
                expect.any(Object)
            );
        });
    });

    test('handles submission error', async () => {
        render(<EditDocumentPage />);

        const file = createFile(1024 * 1024);
        const input = screen.getByTestId('file-upload-input');

        // Mock API error
        const errorMessage = 'Failed to upload file';
        api.post.mockRejectedValueOnce(new Error(errorMessage));

        // Select file and submit
        fireEvent.change(input, { target: { files: [file] } });
        fireEvent.click(screen.getByRole('button', { name: 'Submit Edit' }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    test('shows error when submitting without file', () => {
        render(<EditDocumentPage />);

        fireEvent.click(screen.getByRole('button', { name: 'Submit Edit' }));

        expect(screen.getByText('Please select a file to submit.')).toBeInTheDocument();
    });

    test('button is disabled during submission', async () => {
        render(<EditDocumentPage />);

        const file = createFile(1024 * 1024);
        const input = screen.getByTestId('file-upload-input');

        // Mock delayed API response
        api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        // Select file and submit
        fireEvent.change(input, { target: { files: [file] } });
        fireEvent.click(screen.getByRole('button', { name: 'Submit Edit' }));

        // Button should be disabled and show loading state
        const button = screen.getByRole('button', { name: 'Submitting...' });
        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

    test('clears error when selecting new valid file', () => {
        render(<EditDocumentPage />);

        // First select an invalid file
        const largeFile = createFile(6 * 1024 * 1024);
        const input = screen.getByTestId('file-upload-input');

        fireEvent.change(input, { target: { files: [largeFile] } });
        expect(screen.getByText('File size must be less than 5MB.')).toBeInTheDocument();

        // Then select a valid file
        const validFile = createFile(1024 * 1024);
        fireEvent.change(input, { target: { files: [validFile] } });

        expect(screen.queryByText('File size must be less than 5MB.')).not.toBeInTheDocument();
    });

    test('verifies FormData construction', async () => {
        render(<EditDocumentPage />);

        const file = createFile(1024 * 1024);
        const input = screen.getByTestId('file-upload-input');

        api.post.mockImplementation((url, formData) => {
            // Verify FormData contains the file
            expect(formData.get('file')).toBeTruthy();
            expect(formData.get('file').name).toBe('test.pdf');
            return Promise.resolve({});
        });

        fireEvent.change(input, { target: { files: [file] } });
        fireEvent.click(screen.getByRole('button', { name: 'Submit Edit' }));

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
        });
    });
});