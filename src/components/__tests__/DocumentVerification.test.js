import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentVerification from '../DocumentVerification';
import axios from 'axios';

jest.mock('axios');

describe('DocumentVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders DocumentVerification component', () => {
    render(<DocumentVerification />);
    expect(screen.getByText('Document Verification')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a file:')).toBeInTheDocument();
    expect(screen.getByText('Submit Document')).toBeInTheDocument();
    expect(screen.getByText('Verify Document')).toBeInTheDocument();
  });

  test('handles file selection', () => {
    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(fileInput.files[0]).toBe(file);
  });

  test('submits document successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { documentSubmissionResult: 'Success' } });

    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const submitButton = screen.getByText('Submit Document');

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Document submitted. Result: Success')).toBeInTheDocument();
    });
  });

  test('handles submission error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { errorMessage: 'Submission failed' } } });

    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const submitButton = screen.getByText('Submit Document');

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
    });
  });

  test('verifies document successfully', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        document: {
          documentId: '123',
          name: 'test.pdf',
          hashString: 'abc123',
          owner: 'Verified'
        }
      }
    });

    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const verifyButton = screen.getByText('Verify Document');

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Verification Result:')).toBeInTheDocument();
      expect(screen.getByText('Document ID: 123')).toBeInTheDocument();
      expect(screen.getByText('File Name: test.pdf')).toBeInTheDocument();
      expect(screen.getByText('Hash: abc123')).toBeInTheDocument();
      expect(screen.getByText('Status: Verified')).toBeInTheDocument();
    });
  });

  test('handles verification error', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { errorMessage: 'Verification failed' } } });

    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const verifyButton = screen.getByText('Verify Document');

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Verification failed')).toBeInTheDocument();
    });
  });
});