import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentVerification from '../DocumentVerification';

const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

describe('DocumentVerification Component', () => {
  test('renders DocumentVerification component', async () => {
    render(<DocumentVerification />);
    await waitFor(() => {
      expect(screen.getByText('Document Verification')).toBeInTheDocument();
    });
  });

  test('allows file selection and verification', async () => {
    render(<DocumentVerification />);
    
    const fileInput = await screen.findByLabelText(/choose a file/i);
    const verifyButton = await screen.findByRole('button', { name: /verify document/i });

    expect(verifyButton).toBeDisabled();

    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => {
      expect(verifyButton).not.toBeDisabled();
    });

    fireEvent.click(verifyButton);
    await waitFor(() => {
      expect(screen.getByText(/Hash:/)).toBeInTheDocument();
      expect(screen.getByText(/Verified:/)).toBeInTheDocument();
    });
  });
});