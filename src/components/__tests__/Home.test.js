import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../Home';

// Mock the useNavigate hook
const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('Home Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  });

  test('renders branding elements', () => {
    expect(screen.getByText('MOMOFIN')).toBeInTheDocument();
    expect(screen.getByText('A safer place to store your documents.')).toBeInTheDocument();
  });

  test('renders View Documents box', () => {
    expect(screen.getByText('View Documents')).toBeInTheDocument();
  });

  test('renders Upload and Verify Documents box', () => {
    expect(screen.getByText('Upload and Verify Documents')).toBeInTheDocument();
  });

  test('navigates to viewDocuments when View Documents is clicked', () => {
    fireEvent.click(screen.getByText('View Documents'));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('viewDocuments');
  });

  test('navigates to verify when Upload and Verify Documents is clicked', () => {
    fireEvent.click(screen.getByText('Upload and Verify Documents'));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('verify');
  });

  test('action boxes have correct cursor style', () => {
    const viewBox = screen.getByText('View Documents').closest('div');
    const verifyBox = screen.getByText('Upload and Verify Documents').closest('div');

    expect(viewBox).toHaveStyle('cursor: pointer');
    expect(verifyBox).toHaveStyle('cursor: pointer');
  });

  test('home-container class is applied', () => {
    const container = screen.getByRole('heading', { name: /MOMOFIN/i }).closest('div').parentElement; // Access the parent element
    expect(container).toHaveClass('home-container');
  });
  

  test('action-boxes-container class is applied', () => {
    const actionBoxesContainer = screen.getByText('View Documents').closest('div').parentElement;
    expect(actionBoxesContainer).toHaveClass('action-boxes-container');
  });

  test('action-box class is applied to both boxes', () => {
    const viewBox = screen.getByText('View Documents').closest('div');
    const verifyBox = screen.getByText('Upload and Verify Documents').closest('div');

    expect(viewBox).toHaveClass('action-box');
    expect(viewBox).toHaveClass('view-box');
    expect(verifyBox).toHaveClass('action-box');
    expect(verifyBox).toHaveClass('verify-box');
  });
});