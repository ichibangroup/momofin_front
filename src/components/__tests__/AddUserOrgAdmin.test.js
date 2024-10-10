import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddUserOrgAdmin from '../AddUserOrgAdmin';

describe('AddUserOrgAdmin', () => {
  it('renders with correct title', () => {
    render(<AddUserOrgAdmin />);
    expect(screen.getByText('Add User (Org Admin)')).toBeInTheDocument();
  });
});