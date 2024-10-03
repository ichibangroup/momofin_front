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
      expect(console.error).toHaveBeenCalledWith('Failed to fetch users:', expect.any(Error));
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
});
