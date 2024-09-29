import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentVerification, { 
  SimpleHashGenerator, 
  AdvancedHashGenerator, 
  SimpleVerifier, 
  IHashGenerator, 
  IVerifier,
  DocumentProcessor
} from '../components/DocumentVerification';

describe('DocumentVerification Component', () => {
  test('renders DocumentVerification component', () => {
    render(<DocumentVerification />);
    expect(screen.getByText('Document Verification')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose a file:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify Document' })).toBeDisabled();
  });

  test('enables verify button when file is selected', () => {
    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const verifyButton = screen.getByRole('button', { name: 'Verify Document' });

    expect(verifyButton).toBeDisabled();

    fireEvent.change(fileInput, { target: { files: [new File([''], 'test.pdf', { type: 'application/pdf' })] } });

    expect(verifyButton).not.toBeDisabled();
  });

  test('displays hash and verification result when verify button is clicked', () => {
    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const verifyButton = screen.getByRole('button', { name: 'Verify Document' });

    fireEvent.change(fileInput, { target: { files: [new File([''], 'test.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(verifyButton);

    expect(screen.getByText(/Hash: simple_hash_test.pdf/)).toBeInTheDocument();
    expect(screen.getByText(/Verified: Yes/)).toBeInTheDocument();
  });

  test('works with AdvancedHashGenerator', () => {
    render(<DocumentVerification hashGenerator={new AdvancedHashGenerator()} />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const verifyButton = screen.getByRole('button', { name: 'Verify Document' });

    fireEvent.change(fileInput, { target: { files: [new File([''], 'test.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(verifyButton);

    expect(screen.getByText(/Hash: advanced_hash_test.pdf/)).toBeInTheDocument();
    expect(screen.getByText(/Verified: Yes/)).toBeInTheDocument();
  });

  test('handles verification failure', () => {
    const failingVerifier = new SimpleVerifier();
    failingVerifier.verify = jest.fn().mockReturnValue(false);
    
    render(<DocumentVerification verifier={failingVerifier} />);
    const fileInput = screen.getByLabelText('Choose a file:');
    const verifyButton = screen.getByRole('button', { name: 'Verify Document' });

    fireEvent.change(fileInput, { target: { files: [new File([''], 'test.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(verifyButton);

    expect(screen.getByText(/Hash: simple_hash_test.pdf/)).toBeInTheDocument();
    expect(screen.getByText(/Verified: No/)).toBeInTheDocument();
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
  test('processes document correctly', () => {
    const hashGenerator = new SimpleHashGenerator();
    const verifier = new SimpleVerifier();
    const processor = new DocumentProcessor(hashGenerator, verifier);
    const result = processor.processDocument({ name: 'test.pdf' });
    expect(result).toEqual({ hash: 'simple_hash_test.pdf', isVerified: true });
  });
});