import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingIndicator from '../LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders without crashing', () => {
    render(<LoadingIndicator />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('has correct structure and classes', () => {
    render(<LoadingIndicator />);
    const outerDiv = screen.getByTestId('loading-indicator');
    const innerDiv = screen.getByTestId('spinner');

    expect(outerDiv).toHaveClass('flex', 'justify-center', 'items-center', 'h-full');
    expect(innerDiv).toHaveClass('animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-t-2', 'border-b-2', 'border-blue-500');
  });

  it('is accessible', () => {
    render(<LoadingIndicator />);
    const loadingIndicator = screen.getByRole('status');
    expect(loadingIndicator).toHaveAccessibleName('Loading');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<LoadingIndicator />);
    expect(asFragment()).toMatchSnapshot();
  });
});