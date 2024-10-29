import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ViewOrgUsers from '../ViewOrgUsers';
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import api from "../../utils/api";

// Extended mock data to test various sorting scenarios
const mockUsers = [
    { 
        userId: 1, 
        name: 'Galih Ibrahim Kurniawan', 
        username: 'Sirered', 
        position: 'CHIEF EXECUTIVE OFFICER', 
        email: 'emailme@example.com', 
        momofinAdmin: true, 
        organizationAdmin: false 
    },
    { 
        userId: 2, 
        name: 'Clayton Ismail Nagle', 
        username: 'Clay.ton', 
        position: 'CTO', 
        email: 'email.yeah@gmail.com', 
        momofinAdmin: false, 
        organizationAdmin: true 
    },
    { 
        userId: 3, 
        name: 'Muhammad Sakhran Thayyib', 
        username: 'PeakFiction', 
        position: 'Head of Diagnostics', 
        email: 'email.yeah@gmail.com', 
        momofinAdmin: false, 
        organizationAdmin: false 
    },
    // Edge cases for sorting
    { 
        userId: 4, 
        name: '', 
        username: null, 
        position: undefined, 
        email: '', 
        momofinAdmin: false, 
        organizationAdmin: false 
    }
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

describe('ViewUsers Sorting Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        api.get.mockResolvedValue({ data: mockUsers, status: 200 });
        jest.mocked(useParams).mockReturnValue({ id: '123' });
    });

    // Test sorting by different columns
    const columns = ['name', 'username', 'position', 'email'];
    columns.forEach(column => {
        describe(`Sorting by ${column}`, () => {
            it(`sorts ${column} in ascending order on first click`, async () => {
                renderWithRouter();
                await waitFor(() => {
                    expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
                });

                // Click the column header
                const header = screen.getByText(column.charAt(0).toUpperCase() + column.slice(1));
                fireEvent.click(header);

                // Get all cells in that column
                const cells = screen.getAllByRole('cell');
                const columnIndex = columns.indexOf(column) + 1; // +1 because first column is user type
                const columnValues = [];
                
                // Extract column values
                for (let i = columnIndex; i < cells.length; i += 6) {
                    columnValues.push(cells[i].textContent.toLowerCase());
                }

                // Check if values are sorted ascending
                const sortedValues = [...columnValues].sort();
                expect(columnValues).toEqual(sortedValues);
            });

            it(`sorts ${column} in descending order on second click`, async () => {
                renderWithRouter();
                await waitFor(() => {
                    expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
                });

                // Click twice
                const header = screen.getByText(column.charAt(0).toUpperCase() + column.slice(1));
                fireEvent.click(header);
                fireEvent.click(header);

                const cells = screen.getAllByRole('cell');
                const columnIndex = columns.indexOf(column) + 1;
                const columnValues = [];
                
                for (let i = columnIndex; i < cells.length; i += 6) {
                    columnValues.push(cells[i].textContent.toLowerCase());
                }

                // Check if values are sorted descending
                const sortedValues = [...columnValues].sort().reverse();
                expect(columnValues).toEqual(sortedValues);
            });
        });
    });

    // Test edge cases in sorting
    describe('Sorting edge cases', () => {
        it('handles null values when sorting', async () => {
            renderWithRouter();
            await waitFor(() => {
                expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
            });

            // Click username column which has a null value
            const usernameHeader = screen.getByText('Username');
            fireEvent.click(usernameHeader);

            const cells = screen.getAllByRole('cell');
            const columnValues = [];
            
            // Extract username values
            for (let i = 2; i < cells.length; i += 6) {
                columnValues.push(cells[i].textContent);
            }

            // Empty strings (from null/undefined values) should be at the start when ascending
            expect(columnValues[0]).toBe('');
        });

        it('handles undefined values when sorting', async () => {
            renderWithRouter();
            await waitFor(() => {
                expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
            });

            // Click position column which has an undefined value
            const positionHeader = screen.getByText('Position');
            fireEvent.click(positionHeader);

            const cells = screen.getAllByRole('cell');
            const columnValues = [];
            
            for (let i = 3; i < cells.length; i += 6) {
                columnValues.push(cells[i].textContent);
            }

            // Empty strings (from null/undefined values) should be at the start when ascending
            expect(columnValues[0]).toBe('');
        });

        it('handles empty string values when sorting', async () => {
            renderWithRouter();
            await waitFor(() => {
                expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
            });

            // Click name column which has an empty string value
            const nameHeader = screen.getByText('Name');
            fireEvent.click(nameHeader);

            const cells = screen.getAllByRole('cell');
            const columnValues = [];
            
            for (let i = 1; i < cells.length; i += 6) {
                columnValues.push(cells[i].textContent);
            }

            // Empty strings should be at the start when ascending
            expect(columnValues[0]).toBe('');
        });

        it('maintains sort direction when switching columns', async () => {
            renderWithRouter();
            await waitFor(() => {
                expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
            });

            // Click name column twice to sort descending
            const nameHeader = screen.getByText('Name');
            fireEvent.click(nameHeader);
            fireEvent.click(nameHeader);

            // Then click username column
            const usernameHeader = screen.getByText('Username');
            fireEvent.click(usernameHeader);

            // Check that username is sorted ascending (new column should start with ascending)
            const cells = screen.getAllByRole('cell');
            const columnValues = [];
            
            for (let i = 2; i < cells.length; i += 6) {
                columnValues.push(cells[i].textContent.toLowerCase());
            }

            const sortedValues = [...columnValues].sort();
            expect(columnValues).toEqual(sortedValues);
        });
    });

    // Test sort icons
    describe('Sort icons', () => {
        it('shows correct sort icon for active column', async () => {
            renderWithRouter();
            await waitFor(() => {
                expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
            });

            const nameHeader = screen.getByText('Name');
            
            // Initial state
            expect(nameHeader.querySelector('.fa-sort')).toBeTruthy();
            
            // After first click (ascending)
            fireEvent.click(nameHeader);
            expect(nameHeader.querySelector('.fa-sort-up')).toBeTruthy();
            
            // After second click (descending)
            fireEvent.click(nameHeader);
            expect(nameHeader.querySelector('.fa-sort-down')).toBeTruthy();
        });

        it('resets sort icon when switching columns', async () => {
            renderWithRouter();
            await waitFor(() => {
                expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
            });

            const nameHeader = screen.getByText('Name');
            const usernameHeader = screen.getByText('Username');
            
            // Sort name column
            fireEvent.click(nameHeader);
            expect(nameHeader.querySelector('.fa-sort-up')).toBeTruthy();
            
            // Switch to username column
            fireEvent.click(usernameHeader);
            expect(nameHeader.querySelector('.fa-sort')).toBeTruthy();
            expect(usernameHeader.querySelector('.fa-sort-up')).toBeTruthy();
        });
    });
});