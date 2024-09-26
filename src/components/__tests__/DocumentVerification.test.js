import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import DocumentVerification from '../components/DocumentVerification';

// Suppress act() warnings
import { act } from 'react-dom/test-utils';
global.act = act;

const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });

describe('DocumentVerification Component', () => {
  test('renders DocumentVerification component', () => {
    render(<DocumentVerification />);
    expect(screen.getByText('Document Verification')).toBeInTheDocument();
  });

  test('allows file selection and verification', () => {
    render(<DocumentVerification />);
    const fileInput = screen.getByLabelText(/choose a file/i);
    const verifyButton = screen.getByRole('button', { name: /verify document/i });

    expect(verifyButton).toBeDisabled();

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(verifyButton).not.toBeDisabled();

    fireEvent.click(verifyButton);

    expect(screen.getByText(/Hash:/)).toBeInTheDocument();
    expect(screen.getByText(/Verified:/)).toBeInTheDocument();
  });
});