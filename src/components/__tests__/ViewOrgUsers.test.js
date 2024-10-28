import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ViewOrgUsers from '../ViewOrgUsers';
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import api from "../../utils/api";

const mockUsers = [
    { userId: 1, name: 'Galih Ibrahim Kurniawan', username: 'Sirered', position: 'CHIEF EXECUTIVE OFFICER', email: 'emailme@example.com', momofinAdmin: true, organizationAdmin: false },
    { userId: 2, name: 'Clayton Ismail Nagle', username: 'Clay.ton', position: 'CTO', email: 'email.yeah@gmail.com', momofinAdmin: false, organizationAdmin: true },
    { userId: 3, name: 'Muhammad Sakhran Thayyib', username: 'PeakFiction', position: 'Head of Diagnostics', email: 'email.yeah@gmail.com', momofinAdmin: false, organizationAdmin: false },
];

const renderWithRouter = (organizationId = '123') => {
    return render(
        <MemoryRouter initialEntries={[`/app/configOrganisation/${organizationId}/viewOrganisationUsers`]}>
            <Routes>
                <Route
                    path="/app/configOrganisation/:id/viewOrganisationUsers"
                    element={<ViewOrgUsers />}
                />
            </Routes>
        </MemoryRouter>
    );
};

jest.mock('../../utils/api');
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: jest.fn()
}));

describe('ViewUsers Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        api.get.mockResolvedValue({ data: mockUsers, status: 200 });
    });

    it('renders without crashing', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123');

        await waitFor(() => {
            expect(screen.getByTestId('viewUsers-1')).toBeInTheDocument();
        });
    });

    it('displays the correct title', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123');

        await waitFor(() => {
            expect(screen.getByText('View Organisation Users')).toBeInTheDocument();
        });
    });

    it('fetches and displays users', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123');

        await waitFor(() => {
            expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
            expect(screen.getByText(mockUsers[1].name)).toBeInTheDocument();
            expect(screen.getByText(mockUsers[2].name)).toBeInTheDocument();
        });
    });

    it('handles API errors', async () => {
        api.get.mockRejectedValue(new Error('Network Error'));
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123');

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch organisation users')).toBeInTheDocument();
        });
    });

    it('displays loading state', () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        api.get.mockImplementationOnce(() => new Promise(() => {})); // Simulate pending promise
        renderWithRouter('123');
        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123');

        await waitFor(() => {
            const nameHeader = screen.getByText('Name');
            nameHeader.click(); // Click to sort
        });

        await waitFor(() => {
            const firstUser = screen.getByText('Clayton Ismail Nagle'); // Check first user after sort
            expect(firstUser).toBeInTheDocument();
        });
    });

    it('renders user icons based on roles', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123');

        await waitFor(() => {
            expect(screen.getByTitle('Momofin Admin')).toBeInTheDocument();
            expect(screen.getByTitle('Organisation Admin')).toBeInTheDocument();
            expect(screen.queryByTitle('User')).toBeInTheDocument(); // Should be present for regular user
        });
    });

    it('redirects to login if no organization ID', () => {
        jest.mocked(useParams).mockReturnValue({ id: undefined });
        renderWithRouter(undefined);

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
