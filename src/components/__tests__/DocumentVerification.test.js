import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import DocumentVerification from '../DocumentVerification';

const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

describe('DocumentVerification Component', () => {
  test('renders DocumentVerification component', async () => {
    await act(async () => {
      render(<DocumentVerification />);
    });
    expect(screen.getByText('Document Verification')).toBeInTheDocument();
  });

  test('allows file selection and verification', async () => {
    await act(async () => {
      render(<DocumentVerification />);
    });
    const fileInput = screen.getByLabelText(/choose a file/i);
    const verifyButton = screen.getByRole('button', { name: /verify document/i });

    expect(verifyButton).toBeDisabled();

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(verifyButton).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(verifyButton);
    });

    expect(screen.getByText(/Hash:/)).toBeInTheDocument();
    expect(screen.getByText(/Verified:/)).toBeInTheDocument();
  });
});