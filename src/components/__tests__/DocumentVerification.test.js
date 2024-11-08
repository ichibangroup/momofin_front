import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentVerification, {
  SimpleHashGenerator,
  AdvancedHashGenerator,
  SimpleVerifier,
  IHashGenerator,
  IVerifier,
  DocumentProcessor
} from '../DocumentVerification';
import api from '../../utils/api';


jest.mock('../../utils/api');

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

  test('handles file size limit', () => {
    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    expect(screen.getByText('File size must be less than 5MB.')).toBeInTheDocument();
  });

  test('submits document successfully', async () => {
    api.post.mockResolvedValueOnce({ data: { documentSubmissionResult: 'Success' } });

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
    api.post.mockRejectedValueOnce({ response: { data: { errorMessage: 'Submission failed' } } });

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
    api.post.mockResolvedValueOnce({
      data: {
        document: {
          documentId: '123',
          name: 'test.pdf',
          hashString: 'abc123',
          owner: {
            name: 'John Doe',
            email: 'john@example.com',
            position: 'Manager'
          }
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
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
    });
  });

  test('handles submit when file is null', async () => {
    render(<DocumentVerification />);
    const submitButton = screen.getByText('Submit Document');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a file to submit.')).toBeInTheDocument();
    });
  });

  test('handles verification when file is null', async () => {
    render(<DocumentVerification />);
    const verifyButton = screen.getByText('Verify Document');

    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a file to verify.')).toBeInTheDocument();
    });
  });

  test('handles submission error when error message is missing', async () => {
    api.post.mockRejectedValueOnce({ response: {} });

    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const submitButton = screen.getByText('Submit Document');

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error submitting document')).toBeInTheDocument();
    });
  });

  test('handles verification error when error message is missing', async () => {
    api.post.mockRejectedValueOnce({ response: {} });

    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const verifyButton = screen.getByText('Verify Document');

    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Error verifying document')).toBeInTheDocument();
    });
  });

  test('handles verification error', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { errorMessage: 'Verification failed' } } });

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

describe('Hash Generators and Verifiers', () => {
  test('IHashGenerator throws error', () => {
    const hashGenerator = new IHashGenerator();
    expect(() => hashGenerator.generateHash({})).toThrow("Method 'generateHash()' must be implemented.");
  });

  test('IVerifier throws error', () => {
    const verifier = new IVerifier();
    expect(() => verifier.verify('')).toThrow("Method 'verify()' must be implemented.");
  });

  test('SimpleHashGenerator generates correct hash', () => {
    const hashGenerator = new SimpleHashGenerator();
    expect(hashGenerator.generateHash({ name: 'test.pdf' })).toBe('simple_hash_test.pdf');
  });

  test('AdvancedHashGenerator generates correct hash', () => {
    const hashGenerator = new AdvancedHashGenerator();
    expect(hashGenerator.generateHash({ name: 'test.pdf' })).toBe('advanced_hash_test.pdf');
  });

  test('SimpleVerifier verifies correctly', () => {
    const verifier = new SimpleVerifier();
    expect(verifier.verify('simple_hash_test.pdf')).toBe(true);
    expect(verifier.verify('advanced_hash_test.pdf')).toBe(true);
    expect(verifier.verify('invalid_hash')).toBe(false);
  });
});

describe('DocumentProcessor', () => {
  let processor;
  let mockHashGenerator;
  let mockVerifier;

  beforeEach(() => {
    mockHashGenerator = { generateHash: jest.fn() };
    mockVerifier = { verify: jest.fn() };
    processor = new DocumentProcessor(mockHashGenerator, mockVerifier);
  });

  test('submitDocument calls api.post with correct arguments', async () => {
    const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    api.post.mockResolvedValueOnce({ data: 'success' });

    await processor.submitDocument(mockFile);

    expect(api.post).toHaveBeenCalledWith(
        '/doc/submit',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });

  test('verifyDocument calls api.post with correct arguments', async () => {
    const mockFile = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    api.post.mockResolvedValueOnce({ data: 'success' });

    await processor.verifyDocument(mockFile);

    expect(api.post).toHaveBeenCalledWith(
        '/doc/verify',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  });
});