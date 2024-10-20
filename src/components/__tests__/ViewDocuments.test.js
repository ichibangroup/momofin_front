import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Page from '../ViewDocuments';
import api from '../../utils/api';

jest.mock('../../utils/api');  // Mock the API

const mockDocuments = [
  { id: 1, name: 'Document1' },
  { id: 2, name: 'Document2' }
];

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
