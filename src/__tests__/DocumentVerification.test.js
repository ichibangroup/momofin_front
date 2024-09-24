import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentVerification from '../components/DocumentVerification';

test('renders DocumentVerification component', () => {
  render(<DocumentVerification />);
  const titleElement = screen.getByText(/Document Verification/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders file input and generate hash button', () => {
    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText(/Choose a file/i);
    const generateButton = screen.getByRole('button', { name: /Generate Hash/i });
    
    expect(fileInput).toBeInTheDocument();
    expect(generateButton).toBeInTheDocument();
  });