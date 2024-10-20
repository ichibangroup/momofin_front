import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import SpecifiedDocumentVerifier from '../SpecifiedDocumentVerifier';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
    useParams: jest.fn()
}));

// Mock the API module
jest.mock('../../utils/api', () => ({
    get: jest.fn(),
    post: jest.fn()
}));

describe('SpecifiedDocumentVerifier', () => {
    const mockDocument = {
        name: 'test-document.pdf',
        hashString: '0x123456789abcdef'
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        useParams.mockReturnValue({ id: '123' });
    });

    it('should fetch and display document details on mount', async () => {
        api.get.mockResolvedValueOnce({ data: mockDocument });

        render(<SpecifiedDocumentVerifier />);

        await waitFor(() => {
            expect(screen.getByText(`Name: ${mockDocument.name}`)).toBeInTheDocument();
            expect(screen.getByText(`Hash: ${mockDocument.hashString}`)).toBeInTheDocument();
        });

        expect(api.get).toHaveBeenCalledWith('/doc/verify/123');
    });

    it('should handle document fetch error', async () => {
        const errorMessage = 'Network error';
        api.get.mockRejectedValueOnce(new Error(errorMessage));

        render(<SpecifiedDocumentVerifier />);
    });

    it('should handle successful file verification', async () => {
        api.get.mockResolvedValueOnce({ data: mockDocument });
        api.post.mockResolvedValueOnce({ data: { message: 'Document verified successfully' } });

        render(<SpecifiedDocumentVerifier />);

        await waitFor(() => {
            expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
        });

        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const fileInput = screen.getByLabelText(/Click to upload/);

        await act(async () => {
            userEvent.upload(fileInput, file);
        });

        await waitFor(() => {
            expect(screen.getByText('Success')).toBeInTheDocument();
            expect(screen.getByText('Document verified successfully')).toBeInTheDocument();
        });

        expect(api.post).toHaveBeenCalledWith(
            '/doc/verify/123',
            expect.any(FormData),
            expect.any(Object)
        );
    });

    it('should handle file verification error', async () => {
        const errorMessage = 'Invalid document format';
        api.get.mockResolvedValueOnce({ data: mockDocument });
        api.post.mockRejectedValueOnce({
            response: {
                data: { errorMessage }
            }
        });

        render(<SpecifiedDocumentVerifier />);

        await waitFor(() => {
            expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
        });

        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const fileInput = screen.getByLabelText(/Click to upload/);

        await act(async () => {
            userEvent.upload(fileInput, file);
        });

        await waitFor(() => {
            expect(screen.getByText('Verification Failed')).toBeInTheDocument();
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('should handle file verification error with fallback message', async () => {
        api.get.mockResolvedValueOnce({ data: mockDocument });
        api.post.mockRejectedValueOnce(new Error());

        render(<SpecifiedDocumentVerifier />);

        await waitFor(() => {
            expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
        });

        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const fileInput = screen.getByLabelText(/Click to upload/);

        await act(async () => {
            userEvent.upload(fileInput, file);
        });

        await waitFor(() => {
            expect(screen.getByText('Verification Failed')).toBeInTheDocument();
            expect(screen.getByText('Failed to verify document')).toBeInTheDocument();
        });
    });

    it('should show verifying state during file upload', async () => {
        api.get.mockResolvedValueOnce({ data: mockDocument });
        api.post.mockImplementation(() => new Promise(() => {}));

        render(<SpecifiedDocumentVerifier />);

        await waitFor(() => {
            expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
        });

        const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
        const fileInput = screen.getByLabelText(/Click to upload/);

        await act(async () => {
            userEvent.upload(fileInput, file);
        });

        expect(screen.getByText('Verifying document...')).toBeInTheDocument();
        expect(fileInput).toBeDisabled();
    });

    it('should not proceed with verification if no file is selected', async () => {
        api.get.mockResolvedValueOnce({ data: mockDocument });

        render(<SpecifiedDocumentVerifier />);

        await waitFor(() => {
            expect(screen.getByText(/Click to upload/)).toBeInTheDocument();
        });

        const fileInput = screen.getByLabelText(/Click to upload/);

        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [] } });
        });

        expect(api.post).not.toHaveBeenCalled();
    });
});