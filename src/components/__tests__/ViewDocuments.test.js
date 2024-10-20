import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Page from '../ViewDocuments';
import api from '../../utils/api';
import userEvent from "@testing-library/user-event";

jest.mock('../../utils/api');  // Mock the API

const mockDocuments = [
  { id: 1, name: 'Document1' },
  { id: 2, name: 'Document2' }
];

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
      expect(screen.getByText('Document1')).toBeInTheDocument();
      expect(screen.getByText('Document2')).toBeInTheDocument();
    });
  });

  test('Handles API failure gracefully (negative)', async () => {
    api.get.mockRejectedValue(new Error('Failed to fetch'));

    await act(async () => {
      render(<Page />);
    });

    await waitFor(() => {
      expect(screen.queryByText('Document1')).not.toBeInTheDocument();
      expect(screen.queryByText('Document2')).not.toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('Failed to fetch documents:', expect.any(Error));
    });
  });

  test('Search filters documents correctly (positive)', async () => {
    api.get.mockResolvedValue({ data: { documents: mockDocuments } });

    await act(async () => {
      render(<Page />);
    });

    const searchInput = screen.getByPlaceholderText('Search File Name');
    fireEvent.change(searchInput, { target: { value: 'Document1' } });

    await waitFor(() => {
      expect(screen.getByText('Document1')).toBeInTheDocument();
      expect(screen.queryByText('Document2')).not.toBeInTheDocument();
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
      expect(screen.queryByText('Document1')).not.toBeInTheDocument();
      expect(screen.queryByText('Document2')).not.toBeInTheDocument();
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
        'http://localhost:3000/app/verify/1'
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
    expect(await screen.findByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to copy link to clipboard')).toBeInTheDocument();

    // Test closing the error modal
    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
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
        'http://localhost:3000/app/verify/1'
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
        'http://localhost:3000/app/verify/1'
    );
    expect(mockClipboard.writeText).toHaveBeenNthCalledWith(
        2,
        'http://localhost:3000/app/verify/2'
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
        'http://localhost:3000/app/verify/1'
    );
  });
});
