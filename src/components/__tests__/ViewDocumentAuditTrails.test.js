import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ViewAuditTrails from '../ViewDocumentAuditTrails';
import api from '../../utils/api';

jest.mock('../../utils/api');

test('renders ViewAuditTrails component', () => {
    render(<ViewAuditTrails />);
    const titleElement = screen.getByText(/View Audits/i);
    expect(titleElement).toBeInTheDocument();
});

test('fetches and displays audit trails successfully', async () => {
    const mockAuditData = [
        { id: 1, username: 'user1', document: 'doc1', action: 'submit', outcome: 'SUCCESS' },
        { id: 2, username: 'user2', document: 'doc2', action: 'verify', outcome: 'FAILED' },
    ];
    api.get.mockResolvedValueOnce({ data: mockAuditData });

    render(<ViewAuditTrails />);

    await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('doc1')).toBeInTheDocument();
        expect(screen.getByText('submit')).toBeInTheDocument();
        expect(screen.getByText('SUCCESS')).toBeInTheDocument();

        expect(screen.getByText('user2')).toBeInTheDocument();
        expect(screen.getByText('doc2')).toBeInTheDocument();
        expect(screen.getByText('verify')).toBeInTheDocument();
        expect(screen.getByText('FAILED')).toBeInTheDocument();
    });
});
