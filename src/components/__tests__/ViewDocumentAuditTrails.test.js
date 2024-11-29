import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ViewAuditTrails from '../ViewDocumentAuditTrails'; 
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
    api.get.mockRejectedValueOnce(new Error('Failed to fetch audits'));

    await act(async () => {
      render(<ViewAuditTrails />);
    });

    await waitFor(() => expect(api.get).toHaveBeenCalled());
    
    expect(screen.getByText('Failed to fetch audits. Please try again later.')).toBeInTheDocument();
  });

  it('should display audit trails in the table when fetched successfully', async () => {
    const mockData = {
      data: {
        content: [
          { id: 1, documentName: 'Doc 1', username: 'user1', action: 'SUBMIT', date: '2024-11-29' }
        ],
        last: true
      }
    };
  
    api.get.mockResolvedValueOnce(mockData);
  
    await act(async () => {
      render(<ViewAuditTrails/>);
    });
  
    await waitFor(() => expect(api.get).toHaveBeenCalled());
  
    expect(screen.getByText('Doc 1')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    const submitElements = screen.getAllByText('SUBMIT');
    expect(submitElements.length).toBeGreaterThan(1);
    expect(screen.getByText('2024-11-29')).toBeInTheDocument();
  });

  it('should call API with correct parameters when filters are changed', async () => {
    const mockData = {
      data: { content: [], last: true }
    };
    api.get.mockResolvedValueOnce(mockData);
  
    await act(async () => {
      render(<ViewAuditTrails />);
    });
  
    fireEvent.change(screen.getByPlaceholderText('Filter by Document'), { target: { value: 'Doc 1' } });
    fireEvent.change(screen.getByPlaceholderText('Filter by Username'), { target: { value: 'user1' } });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2024-11-01T00:00' } });
  
    await waitFor(() => expect(api.get).toHaveBeenCalled());
  
    // Check the arguments of each call to api.get
    expect(api.get.mock.calls[0][1].params).toEqual(
      expect.objectContaining({
        direction: 'DESC',
        size: 10,
        sortBy: 'timestamp',
      })
    );
  
    expect(api.get.mock.calls[1][1].params).toEqual(
      expect.objectContaining({
        direction: 'DESC',
        documentName: 'Doc 1',
        size: 10,
        sortBy: 'timestamp',
      })
    );
  
    expect(api.get.mock.calls[2][1].params).toEqual(
      expect.objectContaining({
        direction: 'DESC',
        documentName: 'Doc 1',
        username: 'user1',
        size: 10,
        sortBy: 'timestamp',
      })
    );
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
});