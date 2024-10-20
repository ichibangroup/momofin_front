import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddUserMomofinAdmin from '../AddUserMomofinAdmin';

describe('AddUserMomofinAdmin', () => {
  it('renders with correct title', () => {
    render(<AddUserMomofinAdmin />);
    expect(screen.getByText('Add User (Momofin Admin)')).toBeInTheDocument();
  });
});