import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Page from '../ViewDocuments';
import api from '../../utils/api';
import userEvent from "@testing-library/user-event";

jest.mock('../../utils/api');  // Mock the API

const mockDocuments = [
  { id: 1, name: 'Document 1' },
  { id: 2, name: 'Document 2' }
];
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockClipboard = {
  writeText: jest.fn(),
};
Object.defineProperty(window, 'navigator', {
  value: { clipboard: mockClipboard },
  writable: true,
});

describe('Page component tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});  // Mock console.error
  });

  afterEach(() => {
    jest.restoreAllMocks();  // Restore console mocks after tests
  });

  test('Component renders and fetches documents on mount (positive)', async () => {
    api.get.mockResolvedValue({ data: { documents: mockDocuments } });

    await act(async () => {
      render(<Page />);
    });

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
    });
  });

  test('Handles API failure gracefully (negative)', async () => {
    api.get.mockRejectedValue(new Error('Failed to fetch'));

    await act(async () => {
      render(<Page />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Document 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Document 2')).not.toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('Failed to fetch documents:', expect.any(Error));
    });
  });

  test('Search filters documents correctly (positive)', async () => {
    api.get.mockResolvedValue({ data: { documents: mockDocuments } });

    await act(async () => {
      render(<Page />);
    });

    const searchInput = screen.getByPlaceholderText('Search File Name');
    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.queryByText('Document 2')).not.toBeInTheDocument();
    });
  });

  test('Filter with no results (negative)', async () => {
    api.get.mockResolvedValue({ data: { documents: mockDocuments } });

    await act(async () => {
      render(<Page />);
    });

    const searchInput = screen.getByPlaceholderText('Search File Name');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    await waitFor(() => {
      expect(screen.queryByText('Document 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Document 2')).not.toBeInTheDocument();
    });
  });

  test('opens the document in a new tab when "View" button is clicked', async () => {
    const mockDocuments = {
      data: {
        documents: [
          { documentId: '1', name: 'Document 1' },
        ],
      },
    };

    const mockViewResponse = {
      data: { url: 'http://example.com/document.pdf' },
    };

    // Mock API calls
    api.get
        .mockResolvedValueOnce(mockDocuments) // Initial fetch
        .mockResolvedValueOnce(mockViewResponse); // Fetch document URL

    render(<Page />);

    // Wait for documents to be displayed
    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });

    // Spy on `window.open`
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});

    // Click on the "View" button
    const viewButton = screen.getByRole('button', { name: /view/i });
    fireEvent.click(viewButton);

    // Assert window.open was called with the correct URL
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('http://example.com/document.pdf', '_blank');
    });

    // Cleanup spy
    openSpy.mockRestore();
  });

  test('displays an error if document fetching fails', async () => {
    const mockDocuments = {
      data: {
        documents: [
          { documentId: '1', name: 'Document 1' },
        ],
      },
    };

    // Mock successful fetch for documents
    api.get.mockResolvedValueOnce(mockDocuments);

    // Mock failed fetch for document URL
    api.get.mockRejectedValueOnce(new Error('Failed to get document URL'));

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
    });

    const viewButton = screen.getByRole('button', { name: /view/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      const errorText = screen.getByText('Failed to load document: An unknown error occurred')
      expect(errorText).toBeInTheDocument();
      fireEvent.click(screen.getByText('Close'))
      expect(errorText).not.toBeInTheDocument();
    });
  });
});

describe('Page Component - Link Copying Tests', () => {
  const mockDocuments = [
    { documentId: '1', name: 'Document 1' },
    { documentId: '2', name: 'Document 2' },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock the API response
    api.get.mockImplementation((url) => {
      if (url === '/doc/view') {
        return Promise.resolve({ data: { documents: mockDocuments } });
      }
      return Promise.resolve({ data: { url: 'http://example.com' } });
    });

    api.post.mockImplementation((url) =>{
      return Promise.resolve({data: { editRequest: 'Fine'}});
    });
  });

  test('renders Copy Link buttons for each document', async () => {
    render(<Page />);

    await waitFor(() => {
      const copyButtons = screen.getAllByText('Copy Link');
      expect(copyButtons).toHaveLength(2);
    });
  });

  test('copies correct verification URL to clipboard when Copy Link is clicked', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Copy Link')).toHaveLength(2);
    });

    const copyButtons = screen.getAllByText('Copy Link');
    await fireEvent.click(copyButtons[0]);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://avento-trust.netlify.app/app/verify/1'
    );
  });

  test('shows success state after copying link', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Copy Link')).toHaveLength(2);
    });

    const copyButton = screen.getAllByText('Copy Link')[0];
    await userEvent.click(copyButton);

    // Check if the button text changes to "Copied!"
    expect(await screen.findByText('Copied!')).toBeInTheDocument();

    // After 2 seconds, it should change back
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2100));
    });

    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
    expect(screen.getAllByText('Copy Link')).toHaveLength(2);
  });

  test('shows error modal when clipboard API fails', async () => {
    // Mock clipboard API to fail
    mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Copy Link')).toHaveLength(2);
    });

    const copyButton = screen.getAllByText('Copy Link')[0];
    await userEvent.click(copyButton);

    // Check if error modal appears
    expect(await screen.findByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Failed to copy link to clipboard')).toBeInTheDocument();

    // Test closing the error modal
    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);

    expect(screen.queryByText('Info')).not.toBeInTheDocument();
  });

  test('handles multiple rapid clicks on copy button', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Copy Link')).toHaveLength(2);
    });

    const copyButton = screen.getAllByText('Copy Link')[0];

    // Click multiple times rapidly
    await userEvent.click(copyButton);
    await userEvent.click(copyButton);
    await userEvent.click(copyButton);

    // Should only copy once for multiple rapid clicks
    expect(mockClipboard.writeText).toHaveBeenCalledTimes(3);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://avento-trust.netlify.app/app/verify/1'
    );
  });

  test('maintains correct copy state for multiple documents', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Copy Link')).toHaveLength(2);
    });

    const copyButtons = screen.getAllByText('Copy Link');

    // Click first document's copy button
    await userEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });
    // Check that only the first button shows "Copied!"

    // Click second document's copy button
    await userEvent.click(copyButtons[1]);

    // Check that the copy state moved to the second button
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();

    // Verify correct URLs were copied
    expect(mockClipboard.writeText).toHaveBeenNthCalledWith(
        1,
        'https://avento-trust.netlify.app/app/verify/1'
    );
    expect(mockClipboard.writeText).toHaveBeenNthCalledWith(
        2,
        'https://avento-trust.netlify.app/app/verify/2'
    );
  });

  test('search functionality works with copy link buttons', async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getAllByText('Copy Link')).toHaveLength(2);
    });

    // Search for "Document 1"
    const searchInput = screen.getByPlaceholderText('Search File Name');
    await userEvent.type(searchInput, 'Document 1');

    // Should only show one document with copy button
    expect(screen.getAllByText('Copy Link')).toHaveLength(1);

    // Copy link should work for filtered document
    const copyButton = screen.getByText('Copy Link');
    await userEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
        'https://avento-trust.netlify.app/app/verify/1'
    );
  });

  describe('Document Version Modal', () => {
    it('should open document version modal when version history button is clicked', async () => {
      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Click the Version History button
      const versionHistoryButtons = screen.getAllByText('Version History');
      expect(versionHistoryButtons).toHaveLength(2);
      fireEvent.click(versionHistoryButtons[0]);

      // Check if the modal is opened
      expect(screen.getByText('Document Versions')).toBeInTheDocument();
    });

    it('should close document version modal when close button is clicked', async () => {
      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Open the modal
      const versionHistoryButtons = screen.getAllByText('Version History');
      expect(versionHistoryButtons).toHaveLength(2);
      fireEvent.click(versionHistoryButtons[0]);

      // Click the close button
      const closeButton = screen.getByRole('button', { name: /×/i });
      fireEvent.click(closeButton);

      // Check if the modal is closed
      expect(screen.queryByText('Document Versions')).not.toBeInTheDocument();
    });
  });

  describe('Edit Request Modal', () => {
    it('should open edit request modal when request edit button is clicked', async () => {
      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Click the Request Edit button
      const requestEditButtons = screen.getAllByText('Request Edit');
      expect(requestEditButtons).toHaveLength(2);
      fireEvent.click(requestEditButtons[0]);

      // Check if the modal is opened
      expect(screen.getByText('Enter Username')).toBeInTheDocument();
    });

    it('should have the edit button disabled if beingRequested is true', async () => {
      const mockDocuments = {data: {documents: [
        { documentId: '1', name: 'Document 1' , beingRequested: true},
        { documentId: '2', name: 'Document 2' , beingRequested: true},
      ]}};
      api.get.mockResolvedValueOnce(mockDocuments);
      render(<Page />);
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
        const requestEditButtons = screen.getAllByText('Cancel Edit Request');
        expect(requestEditButtons).toHaveLength(2);
      });
    });

    it('should close edit request modal when cancel button is clicked', async () => {
      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Open the modal
      const requestEditButtons = screen.getAllByText('Request Edit');
      expect(requestEditButtons).toHaveLength(2);
      fireEvent.click(requestEditButtons[0]);

      // Click the cancel button
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      // Check if the modal is closed
      await waitFor(() => expect(screen.queryByText('Enter Username')).not.toBeInTheDocument())
    });

    it('should show error when submitting edit request without username', async () => {
      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Open the modal
      const requestEditButtons = screen.getAllByText('Request Edit');
      expect(requestEditButtons).toHaveLength(2);
      fireEvent.click(requestEditButtons[0]);

      // Submit without entering username
      const submitButton = screen.getByText('Submit Request');
      fireEvent.click(submitButton);

      // Check if error message is shown
      expect(screen.getByText('Please enter a username.')).toBeInTheDocument();
    });

    it('should submit edit request successfully with username', async () => {
      // Mock the successful edit request
      api.post.mockResolvedValueOnce({ data: { success: true } });

      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Open the modal
      const requestEditButtons = screen.getAllByText('Request Edit');
      expect(requestEditButtons).toHaveLength(2);
      fireEvent.click(requestEditButtons[0]);

      // Enter username
      const usernameInput = screen.getByPlaceholderText('Enter username');
      await userEvent.type(usernameInput, 'testuser');

      // Submit the form
      const submitButton = screen.getByText('Submit Request');
      fireEvent.click(submitButton);

      // Check if the API was called with correct parameters
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
            `/doc/${mockDocuments[0].documentId}/request-edit`,
            { username: 'testuser' }
        );
      });

      // Check if the modal is closed after successful submission
      await waitFor(() => expect(screen.queryByText('Enter Username')).not.toBeInTheDocument())
    });

    it('should handle edit request submission error', async () => {
      // Mock the failed edit request
      const errorMessage = 'Failed to submit edit request';
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            errorMessage: errorMessage
          }
        }
      });

      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Open the modal
      const requestEditButtons = screen.getAllByText('Request Edit');
      expect(requestEditButtons).toHaveLength(2);
      fireEvent.click(requestEditButtons[0]);

      // Enter username
      const usernameInput = screen.getByPlaceholderText('Enter username');
      await userEvent.type(usernameInput, 'testuser');

      // Submit the form
      const submitButton = screen.getByText('Submit Request');
      fireEvent.click(submitButton);

      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle edit request submission error default text', async () => {
      api.post.mockRejectedValueOnce(
        new Error('Not Good Request')
      );

      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        expect(screen.getByText('Document 1')).toBeInTheDocument();
      });

      // Open the modal
      const requestEditButtons = screen.getAllByText('Request Edit');
      expect(requestEditButtons).toHaveLength(2);
      fireEvent.click(requestEditButtons[0]);

      // Enter username
      const usernameInput = screen.getByPlaceholderText('Enter username');
      await userEvent.type(usernameInput, 'testuser');

      // Submit the form
      const submitButton = screen.getByText('Submit Request');
      fireEvent.click(submitButton);

      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Failed to submit edit request. Please try again.')).toBeInTheDocument();
      });
    });
  });
  describe('ViewDocuments - Cancel Edit Request', () => {
    const mockDocuments = [
      {
        documentId: '1',
        name: 'Test Document',
        beingRequested: true
      },
      {
        documentId: '2',
        name: 'Another Document',
        beingRequested: false
      }
    ];

    beforeEach(() => {
      // Reset the mock before each test
      api.get.mockClear();
      api.delete.mockClear();
    });

    test('renders cancel edit request button when document is being requested', async () => {
      // Mock the get request to return mock documents
      api.get.mockResolvedValue({ data: { documents: mockDocuments } });

      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancel Edit Request');
        expect(cancelButtons).toHaveLength(1);
      });
    });

    test('successfully cancels an edit request', async () => {
      // Mock the get request to return mock documents
      api.get.mockResolvedValueOnce({ data: { documents: mockDocuments } })
          .mockResolvedValueOnce({ data: { documents: mockDocuments.map(doc => ({ ...doc, beingRequested: false })) } });

      // Mock the delete request to succeed
      api.delete.mockResolvedValueOnce({});

      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancel Edit Request');
        expect(cancelButtons).toHaveLength(1);
      });

      // Click the Cancel Edit Request button
      const cancelButton = screen.getByText('Cancel Edit Request');
      fireEvent.click(cancelButton);

      // Verify the delete endpoint was called with correct documentId
      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/doc/edit-request/1/cancel');
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText('Edit request cancelled successfully!')).toBeInTheDocument();
      });
    });

    test('handles cancel edit request error', async () => {
      // Mock the get request to return mock documents
      api.get.mockResolvedValueOnce({ data: { documents: mockDocuments } });

      // Mock the delete request to fail
      api.delete.mockRejectedValueOnce(new Error('Cancellation failed'));

      // Spy on console.error to check error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<Page />);

      // Wait for documents to load
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancel Edit Request');
        expect(cancelButtons).toHaveLength(1);
      });

      // Click the Cancel Edit Request button
      const cancelButton = screen.getByText('Cancel Edit Request');
      fireEvent.click(cancelButton);

      // Verify error handling
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error cancelling edit request:', expect.any(Error));
        expect(screen.getByText(/Failed to cancel edit request/i)).toBeInTheDocument();
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
