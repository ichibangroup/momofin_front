import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import ViewOrgUsers from '../ViewOrgUsers';
import {MemoryRouter, Route, Routes, useParams} from "react-router-dom";
import api from "../../utils/api";
const mockUsers = [
    { name: 'Galih Ibrahim Kurniawan', username: 'Sirered', position: 'CHIEF EXECUTIVE OFFICER', email: 'emailme@example.com' },
    { name: 'Clayton Ismail Nagle', username: 'Clay.ton', position: 'CTO', email: 'email.yeah@gmail.com' },
    { name: 'Muhammad Sakhran Thayyib', username: 'PeakFiction', position: 'Head of Diagnostics', email: 'email.yeah@gmail.com' },
    { name: 'Gregorius Samuel Hutahaean', username: 'FreddyFazbear', position: 'Mere Peasant', email: 'email.yeah@gmail.com' },
    { name: 'Galih Ibrahim Kurniawa', username: 'Sireblue', position: 'CEO', email: 'email.yeah@gmail.com' },
    { name: 'Clayton Ismail Nagl', username: 'Clay.ton', position: 'CTO', email: 'email.yeah@gmail.com' },
    { name: 'Muhammad Sakhran Thayyi', username: 'PeakFiction', position: 'Head of Diagnostics', email: 'email.yeah@gmail.com' },
    { name: 'Gregorius Samuel Hutahaea', username: 'FreddyFazbear', position: 'Mere Peasant', email: 'email.yeah@gmail.com' },
]
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
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup the api.get mock with the default successful response
        api.get.mockResolvedValue({
            data: mockUsers,
            status: 200
        });
    });


    it('renders without crashing', () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123')
        expect(screen.getByTestId('viewUsers-1')).toBeInTheDocument();
    });

    it('displays the correct title', () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123')
        expect(screen.getByText('View Organisation Users')).toBeInTheDocument();
    });

    it('fetches and displays users', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123');

        // Wait for the API call to complete
        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith('/api/organizations/123/users');
        });

        // Wait for the user data to be displayed
        await waitFor(() => {
            expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
            expect(screen.getByText('Sirered')).toBeInTheDocument();
            expect(screen.getByText('CHIEF EXECUTIVE OFFICER')).toBeInTheDocument();
            expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
        });
    });

    it('renders action buttons for each user', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123')

        await waitFor(() => {
            const editButtons = screen.getAllByText('✏️');
            const deleteButtons = screen.getAllByText('❌');

            // Check that there is at least one '✏️' and '❌' button
            expect(editButtons.length).toBeGreaterThan(0);
            expect(deleteButtons.length).toBeGreaterThan(0);

            // Optionally, check that each button is in the document
            editButtons.forEach(button => expect(button).toBeInTheDocument());
            deleteButtons.forEach(button => expect(button).toBeInTheDocument());
        });
    });

    it('renders the ADD USER button with correct link', () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        renderWithRouter('123')

        const addUserButton = screen.getByText('ADD USER');
        expect(addUserButton).toBeInTheDocument();
        expect(addUserButton.closest('a')).toHaveAttribute('href', '/app/configOrganisation/123/addUserOrgAdmin');
    });

    it('handles fetch error gracefully', async () => {
        jest.mocked(useParams).mockReturnValue({ id: '123' });
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        api.get.mockImplementationOnce(() => Promise.reject(new Error('API Error')));

        renderWithRouter('123')

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching organisation users:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('should navigate to login when id is not present', async () => {
        // Mock useParams to return no id
        jest.mocked(useParams).mockReturnValue({ id: undefined });

        renderWithRouter();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        // Verify API was not called
        expect(api.get).not.toHaveBeenCalled();
    });
});