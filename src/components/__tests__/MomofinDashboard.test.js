import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Needed to use `useNavigate`
import MomofinDashboard from '../MomofinDashboard';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('MomofinDashboard', () => {
  beforeEach(() => {
    mockNavigate.mockClear(); // Clear mockNavigate before each test
  });

  test('renders MomofinDashboard component', () => {
    render(
      <BrowserRouter>
        <MomofinDashboard />
      </BrowserRouter>
    );

    // Check for branding text
    expect(screen.getByText('MOMOFIN')).toBeInTheDocument();
    expect(screen.getByText('A safer place to store your documents.')).toBeInTheDocument();
    
    // Check for action box texts
    expect(screen.getByText('View All Users')).toBeInTheDocument();
    expect(screen.getByText('View All Organisations')).toBeInTheDocument();
  });

  test('navigates to view users page when clicking "View All Users"', () => {
    render(
      <BrowserRouter>
        <MomofinDashboard />
      </BrowserRouter>
    );

    const viewUsersBox = screen.getByText('View All Users');
    fireEvent.click(viewUsersBox);

    expect(mockNavigate).toHaveBeenCalledWith('/app/viewAllUsers');
  });

  test('navigates to view organisations page when clicking "View All Organisations"', () => {
    render(
      <BrowserRouter>
        <MomofinDashboard />
      </BrowserRouter>
    );

    const viewOrganisationsBox = screen.getByText('View All Organisations');
    fireEvent.click(viewOrganisationsBox);

    expect(mockNavigate).toHaveBeenCalledWith('/app/viewOrganisation');
  });
});
