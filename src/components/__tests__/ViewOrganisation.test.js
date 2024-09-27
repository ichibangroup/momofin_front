import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import ViewOrganisation from '../viewOrganisation';

test('should render view organisation component', async () => {
  await act(async () => {
    render(<ViewOrganisation />);
  });

  const viewOrgElement = screen.getByTestId('viewOrg-1');
  expect(viewOrgElement).toBeInTheDocument();
});