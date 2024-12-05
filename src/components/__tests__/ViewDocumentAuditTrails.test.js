import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ViewAuditTrails from '../ViewDocumentAuditTrails'; 
import getSortIcon from '../ViewDocumentAuditTrails'; 
import api from '../../utils/api';

jest.mock('../../utils/api'); 

describe('ViewAuditTrails Component', () => {
  beforeEach(() => {
    api.get.mockReset();
  });

  it('should render without errors', () => {
    render(<ViewAuditTrails />);
    expect(screen.getByText('View Audits')).toBeInTheDocument();
  });

  it('should display loading spinner while fetching data', async () => {
    api.get.mockResolvedValueOnce({
      data: { content: [], last: true }
    });
  
    render(<ViewAuditTrails />);
  
    await waitFor(() => expect(screen.queryByTestId('spinner')).toBeInTheDocument());
  
    await waitFor(() => expect(api.get).toHaveBeenCalled());
  
    await waitFor(() => expect(screen.queryByTestId('spinner')).not.toBeInTheDocument());
  });
  

  it('should display error message on fetch failure', async () => {
    // Mock API to reject with an error
    api.get.mockRejectedValueOnce(new Error('Failed to fetch audits'));

    // Render the component
    render(<ViewAuditTrails />);

    // Wait for the error message to be displayed
    await waitFor(() =>
        expect(screen.getByText(/Failed to fetch audits/i)).toBeInTheDocument()
    );

    // Verify no spinner is present (optional)
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
});



  it('should display audit trails in the table when fetched successfully', async () => {
    const mockData = {
        data: {
            content: [
                { id: 1, documentName: 'Doc 1', username: 'user1', action: 'SUBMIT', date: '2024-11-29' },
            ],
            page: { number: 0, totalPages: 1 },
        },
    };

    // Mock the API response
    api.get.mockResolvedValueOnce(mockData);

    // Render the component
    await act(async () => {
        render(<ViewAuditTrails />);
    });

    // Ensure the API was called
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));

    // Verify the table displays the data correctly
    expect(screen.getByText('Doc 1')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    const submitElements = screen.getAllByText('SUBMIT');
    expect(submitElements.length).toBeGreaterThan(1);
    expect(screen.getByText('2024-11-29')).toBeInTheDocument();

    // Verify the correct number of rows
    const tableRows = screen.getAllByRole('row');
    expect(tableRows.length).toBe(2); // 1 header row + 1 data row
});


  it('should call API with correct parameters when filters are changed', async () => {
    const mockData = {
        data: {
            content: [],
            page: { number: 0, totalPages: 1 },
        },
    };

    // Mock API response
    api.get.mockResolvedValue(mockData);

    // Render the component
    await act(async () => {
        render(<ViewAuditTrails />);
    });

    // Simulate filter changes
    fireEvent.change(screen.getByPlaceholderText('Filter by Document'), {
        target: { value: 'Doc 1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Filter by Username'), {
        target: { value: 'user1' },
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
        target: { value: '2024-11-01T00:00' },
    });

    // Wait for the expected API call to complete
    await waitFor(() => {
        // Check the last call to the mocked API
        expect(api.get).toHaveBeenLastCalledWith('/audit/audits', {
            params: {
                documentName: 'Doc 1',
                username: 'user1',
                startDate: '2024-11-01T00:00',
                sortBy: 'timestamp',
                direction: 'DESC',
                size: 10,
            },
        });
    });
});

  
  

  it('should call load more when "Load More" button is clicked', async () => {
    const mockData = {
      data: { content: [], last: false }
    };
    api.get.mockResolvedValueOnce(mockData);

    await act(async () => {
      render(<ViewAuditTrails />);
    });

    const loadMoreButton = screen.getByTestId('load-more-btn');
    fireEvent.click(loadMoreButton);

    expect(screen.getByTestId('load-more-btn')).toBeInTheDocument(); // Button should still be there
  });

  test('should render the headers correctly with sort icons', () => {
    render(<ViewAuditTrails />);

    // Use data-testid to target headers directly
    expect(screen.getByTestId('header-document')).toHaveTextContent(/Document/);
    expect(screen.getByTestId('header-username')).toHaveTextContent(/User/);
    expect(screen.getByTestId('header-action')).toHaveTextContent(/Action/);
    expect(screen.getByTestId('header-timestamp')).toHaveTextContent(/Date/);
});


test('should update sorting when a header is clicked', () => {
  // Render the component
  render(<ViewAuditTrails />);

  // Find all table headers using getByRole
  const headers = screen.getAllByRole('columnheader');

  // Click on the 'Document' header
  fireEvent.click(headers[0]); // Assuming 'Document' is the first column
  expect(screen.getByTestId('viewAudits-1')).toBeInTheDocument(); // Check the component remains rendered

  // Click on the 'User' header
  fireEvent.click(headers[1]);
  expect(screen.getByTestId('viewAudits-1')).toBeInTheDocument(); // Observe updated DOM status

  fireEvent.click(headers[2]);
  expect(screen.getByTestId('viewAudits-1')).toBeInTheDocument(); // Observe updated DOM status

  fireEvent.click(headers[3]);
  expect(screen.getByTestId('viewAudits-1')).toBeInTheDocument(); // Observe updated DOM status
});
});