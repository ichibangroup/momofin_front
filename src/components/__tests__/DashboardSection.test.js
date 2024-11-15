import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import DashboardSection from '../DashboardSection';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

describe('DashboardSection', () => {
  const mockActionBoxes = [
    {
      label: 'Box 1',
      path: '/box1',
      className: 'box1-class',
      icon: jest.fn(),
    },
    {
      label: 'Box 2',
      path: '/box2',
      className: 'box2-class',
      icon: null,
    },
  ];

  beforeEach(() => {
    useNavigate.mockReturnValue(jest.fn());
  });

  it('renders the branding section with the logo', () => {
    render(
      <Router>
        <DashboardSection
          title="Dashboard"
          actionBoxes={mockActionBoxes}
          backgroundLines={true}
        />
      </Router>
    );

    expect(screen.getByAltText('Avento Logo')).toBeInTheDocument();
  });

  it('renders the action boxes with the correct content', () => {
    render(
      <Router>
        <DashboardSection
          title="Dashboard"
          actionBoxes={mockActionBoxes}
          backgroundLines={true}
        />
      </Router>
    );

    mockActionBoxes.forEach((box) => {
      expect(screen.getByText(box.label)).toBeInTheDocument();
      if (box.icon) {
        expect(screen.getByTestId(`${box.label}-icon`)).toBeInTheDocument();
      }
    });
  });

  it('calls the navigate function when an action box is clicked', () => {
    render(
      <Router>
        <DashboardSection
          title="Dashboard"
          actionBoxes={mockActionBoxes}
          backgroundLines={true}
        />
      </Router>
    );

    fireEvent.click(screen.getByText(mockActionBoxes[0].label));
    expect(useNavigate()).toHaveBeenCalledWith(mockActionBoxes[0].path);
  });

  it('renders the background lines when backgroundLines is true', () => {
    render(
      <Router>
        <DashboardSection
          title="Dashboard"
          actionBoxes={mockActionBoxes}
          backgroundLines={true}
        />
      </Router>
    );

    expect(screen.getByTestId('background-lines')).toBeInTheDocument();
  });

  it('does not render the background lines when backgroundLines is false', () => {
    render(
      <Router>
        <DashboardSection
          title="Dashboard"
          actionBoxes={mockActionBoxes}
          backgroundLines={false}
        />
      </Router>
    );

    expect(screen.queryByTestId('background-lines')).not.toBeInTheDocument();
  });
});