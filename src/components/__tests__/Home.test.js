import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import Home from '../Home';

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),  // Keep the rest of react-router-dom's functionality
  useNavigate: jest.fn(),  // Mock useNavigate
}));

describe('Home', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();  // Create a mock function for navigate
    useNavigate.mockReturnValue(mockNavigate);  // Return the mockNavigate function when useNavigate is called
  });

  it('renders the DashboardSection with correct props', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Check if the logo is present (instead of checking the title text directly)
    expect(screen.getByAltText('Avento Logo')).toBeInTheDocument();

    // Check if both action boxes are rendered
    expect(screen.getByText('View Documents')).toBeInTheDocument();
    expect(screen.getByText('Upload and Verify Documents')).toBeInTheDocument();
  });

  it('renders action box icons correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Check if the icons are rendered correctly
    expect(screen.getByTestId('View Documents-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Upload and Verify Documents-icon')).toBeInTheDocument();
  });

  it('calls the navigate function when an action box is clicked', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Fire a click event on the "View Documents" action box
    fireEvent.click(screen.getByText('View Documents'));
    expect(mockNavigate).toHaveBeenCalledWith('viewDocuments');  // Ensure it's called with the correct path

    // Fire a click event on the "Upload and Verify Documents" action box
    fireEvent.click(screen.getByText('Upload and Verify Documents'));
    expect(mockNavigate).toHaveBeenCalledWith('verify');  // Ensure it's called with the correct path
  });
});