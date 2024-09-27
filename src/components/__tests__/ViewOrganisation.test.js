import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ViewOrganisation from '../viewOrganisation';

test('should render view organisation component', async () => {
  render(<ViewOrganisation />);

  await waitFor(() => {
    const viewOrgElement = screen.getByTestId('viewOrg-1');
    expect(viewOrgElement).toBeInTheDocument();
  });
});