import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import MomofinDashboard from '../MomofinDashboard';

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),  // Keep the rest of react-router-dom's functionality
  useNavigate: jest.fn(),  // Mock useNavigate
}));

describe('MomofinDashboard', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();  // Create a mock function for navigate
    useNavigate.mockReturnValue(mockNavigate);  // Return the mockNavigate function when useNavigate is called
  });

  it('renders the DashboardSection with correct props', () => {
    render(
      <MemoryRouter>
        <MomofinDashboard />
      </MemoryRouter>
    );

    // Check if the logo is present (instead of checking the title text directly)
    expect(screen.getByAltText('Avento Logo')).toBeInTheDocument();

    // Check if both action boxes are rendered
    expect(screen.getByText('View All Users')).toBeInTheDocument();
    expect(screen.getByText('View All Organisations')).toBeInTheDocument();
  });

  it('renders action box icons correctly', () => {
    render(
      <MemoryRouter>
        <MomofinDashboard />
      </MemoryRouter>
    );

    // Check if the icons are rendered correctly
    expect(screen.getByTestId('View All Users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('View All Organisations-icon')).toBeInTheDocument();
  });

  it('calls the navigate function when an action box is clicked', () => {
    render(
      <MemoryRouter>
        <MomofinDashboard />
      </MemoryRouter>
    );

    // Fire a click event on the "View All Users" action box
    fireEvent.click(screen.getByText('View All Users'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/viewAllUsers');  // Ensure it's called with the correct path

    // Fire a click event on the "View All Organisations" action box
    fireEvent.click(screen.getByText('View All Organisations'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/viewOrg');  // Ensure it's called with the correct path
  });
});
