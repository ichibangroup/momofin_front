import { render, screen, cleanup } from '@testing-library/react'

import ViewOrganisation from '../components/viewOrganisation'

test ('should render view organisation component', () => {
    render(<ViewOrganisation/>);

    const viewOrgElement = screen.getAllByTestId('viewOrg-1');
    expect(viewOrgElement).toBeInTheDocument();

})