import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./components/EditProfile', () => () => <div>Edit Profile</div>);

test('renders EditProfile route with userId', () => {
  render(
    <MemoryRouter initialEntries={['/app/editProfile/123']}>
      <App />
    </MemoryRouter>
  );
  
  expect(screen.getByText('Edit Profile')).toBeInTheDocument();
});