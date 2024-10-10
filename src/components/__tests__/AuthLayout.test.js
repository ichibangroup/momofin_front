import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthLayout from './AuthLayout';

// Test that the AuthLayout renders correctly
test('renders AuthLayout with Outlet', () => {
  const { container } = render(
    <MemoryRouter>
      <AuthLayout />
    </MemoryRouter>
  );

  expect(container.firstChild).toHaveClass('auth-layout');
  expect(container.querySelector('.auth-content')).toBeInTheDocument();
});
