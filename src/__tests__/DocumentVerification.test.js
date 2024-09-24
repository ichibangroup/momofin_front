import React from 'react';
import { render, screen } from '@testing-library/react';
import DocumentVerification from '../components/DocumentVerification';

test('renders DocumentVerification component', () => {
  render(<DocumentVerification />);
  const titleElement = screen.getByText(/Document Verification/i);
  expect(titleElement).toBeInTheDocument();
});