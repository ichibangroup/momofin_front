import { render, screen, cleanup } from '@testing-library/react'

import ViewOrganisation from '../viewOrganisation'

test ('should render view organisation component', () => {
    render(<ViewOrganisation/>);

    const viewOrgElement = screen.getByTestId('viewOrg-1');
    expect(viewOrgElement).toBeInTheDocument();

})