import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';

describe('Home Component', () => {
  test('renders Home component with correct content', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('MOMOFIN')).toBeInTheDocument();
    expect(screen.getByText('A safer place to store your documents.')).toBeInTheDocument();
  });

  test('renders action boxes with correct links', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const learnMoreLinks = screen.getAllByText('Learn More');

    expect(learnMoreLinks[0]).toHaveAttribute('href', '/viewDocuments');

    expect(learnMoreLinks[1]).toHaveAttribute('href', '/uploadDocuments');

    expect(learnMoreLinks[2]).toHaveAttribute('href', '/verifyDocuments');
  });
});
