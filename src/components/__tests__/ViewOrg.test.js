import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import ViewOrganisations from '../ViewOrg';
import api from "../../utils/api";

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockOrganisations = [{
    organizationId: '1',
    name: 'Organization 1',
    industry: 'Technology',
    location: '123 Main St, City, State, Country',
    description: 'This is a long description about Organization 1. It provides technology solutions.',
},
{
    organizationId: '2',
    name: 'Organization 2',
    industry: 'Healthcare',
    location: '456 Oak St, City, State, Country',
    description: 'This is a shorter description for Organization 2.',
},
{
    organizationId: '3',
    name: 'Organization 3',
    industry: 'Entertainment',
    location: 'Depok City',
    description: 'Test description for Organization 3',
}];

jest.mock('../../utils/api');

describe('ViewOrganisations Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        api.get.mockResolvedValue({
          data: mockOrganisations,
          status: 200
        });
    });

    it('renders organization data correctly', async () => {
        render(
          <BrowserRouter>
            <ViewOrganisations />
          </BrowserRouter>
        );
    
        await waitFor(() => {
          expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');
          expect(screen.getByText('Organization 1')).toBeInTheDocument();
          expect(screen.getByText('Technology')).toBeInTheDocument();
          expect(screen.getByText('Organization 2')).toBeInTheDocument();
          expect(screen.getByText('Healthcare')).toBeInTheDocument();
        });
    });
    
    it('displays edit and delete buttons for each organization', async () => {
        render(
          <BrowserRouter>
            <ViewOrganisations />
          </BrowserRouter>
        );
    
        await waitFor(() => {
          const editButtons = screen.getAllByTestId("edit-btn");
          const deleteButtons = screen.getAllByTestId("delete-btn");
          expect(editButtons).toHaveLength(3);
          expect(deleteButtons).toHaveLength(3);
        });
    });
    
    it('navigates to add new organisation page when "Add Organisation" button is clicked', async () => {
      render(
        <BrowserRouter>
          <ViewOrganisations />
        </BrowserRouter>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
  
      fireEvent.click(screen.getByText('ADD ORGANISATION'));
      expect(mockNavigate).toHaveBeenCalledWith('/app/momofinDashboard/addNewOrganisation');
  });

  it('cancels edit operation', async () => {
    render(
        <BrowserRouter>
            <ViewOrganisations />
        </BrowserRouter>
    );

    // Wait and click edit
    await waitFor(() => {
        const editButtons = screen.getAllByTestId('edit-btn');
        fireEvent.click(editButtons[0]);
    });

    // Find cancel button by both class and testid
    const cancelButton = screen.getByTestId('cancel-edit-btn');
    fireEvent.click(cancelButton);

    expect(screen.queryByDisplayValue('Technology')).not.toBeInTheDocument();
});
    
    it('handles API fetch error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        api.get.mockRejectedValueOnce(new Error('API Error'));
    
        render(
          <BrowserRouter>
            <ViewOrganisations />
          </BrowserRouter>
        );
    
        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith('Error fetching organizations:', expect.any(Error));
          expect(screen.getByText('Failed to fetch organizations. Please try again later.')).toBeInTheDocument();
        });
    
        consoleSpy.mockRestore();
    });

    it('handles edit mode and updates organization successfully', async () => {
        api.put.mockResolvedValueOnce({ 
            data: { ...mockOrganisations[0], industry: 'NewTech' }
        });

        render(
            <BrowserRouter>
                <ViewOrganisations />
            </BrowserRouter>
        );

        await waitFor(() => {
            const editButtons = screen.getAllByTestId('edit-btn');
            fireEvent.click(editButtons[0]);
        });

        const industryInput = screen.getByDisplayValue('Technology');
        fireEvent.change(industryInput, { target: { value: 'NewTech' } });

        const saveButton = screen.getByText('💾');
        await act(async () => {
            fireEvent.click(saveButton);
        });

        expect(screen.getByText('Organization updated successfully')).toBeInTheDocument();
    });

    it('prevents multiple simultaneous edits', async () => {
        render(
            <BrowserRouter>
                <ViewOrganisations />
            </BrowserRouter>
        );

        await waitFor(() => {
            const editButtons = screen.getAllByTestId('edit-btn');
            fireEvent.click(editButtons[0]);
            fireEvent.click(editButtons[1]);
        });

        expect(screen.getByText('Another edit operation is in progress. Please wait.')).toBeInTheDocument();
    });

    it('handles update error correctly', async () => {
        api.put.mockRejectedValueOnce({ response: { data: { message: 'Update failed' } } });

        render(
            <BrowserRouter>
                <ViewOrganisations />
            </BrowserRouter>
        );

        await waitFor(() => {
            const editButtons = screen.getAllByTestId('edit-btn');
            fireEvent.click(editButtons[0]);
        });

        const saveButton = screen.getByText('💾');
        await act(async () => {
            fireEvent.click(saveButton);
        });

        expect(screen.getByText('Update failed')).toBeInTheDocument();
    });

    it('handles delete confirmation and success', async () => {
        api.delete.mockResolvedValueOnce({});
        
        render(
            <BrowserRouter>
                <ViewOrganisations />
            </BrowserRouter>
        );

        await waitFor(() => {
            const deleteButtons = screen.getAllByTestId('delete-btn');
            fireEvent.click(deleteButtons[0]);
        });

        expect(screen.getByText(/Are you sure you want to delete Organization 1?/)).toBeInTheDocument();

        const confirmButton = screen.getByText('Delete');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        expect(screen.getByText('Organization 1 has been successfully deleted.')).toBeInTheDocument();
    });

    it('handles delete error correctly', async () => {
        api.delete.mockRejectedValueOnce({ response: { data: { message: 'Delete failed' } } });

        render(
            <BrowserRouter>
                <ViewOrganisations />
            </BrowserRouter>
        );

        await waitFor(() => {
            const deleteButtons = screen.getAllByTestId('delete-btn');
            fireEvent.click(deleteButtons[0]);
        });

        const confirmButton = screen.getByText('Delete');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });

    it('cancels delete operation', async () => {
        render(
            <BrowserRouter>
                <ViewOrganisations />
            </BrowserRouter>
        );

        await waitFor(() => {
            const deleteButtons = screen.getAllByTestId('delete-btn');
            fireEvent.click(deleteButtons[0]);
        });

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeInTheDocument();
    });
    it('handles input changes during edit', async () => {
      render(
          <BrowserRouter>
              <ViewOrganisations />
          </BrowserRouter>
      );
  
      await waitFor(() => {
          const editButtons = screen.getAllByTestId('edit-btn');
          fireEvent.click(editButtons[0]);
      });
  
      const locationInput = screen.getByDisplayValue('123 Main St, City, State, Country');
      const descriptionInput = screen.getByDisplayValue('This is a long description about Organization 1. It provides technology solutions.');
  
      fireEvent.change(locationInput, { target: { value: 'New Location' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
  
      expect(screen.getByDisplayValue('New Location')).toBeInTheDocument();
      expect(screen.getByDisplayValue('New Description')).toBeInTheDocument();
  });
  
  it('handles invalid organization for deletion', async () => {
    render(
        <BrowserRouter>
            <ViewOrganisations />
        </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    // Only click the first delete button
    const deleteButtons = screen.getAllByTestId('delete-btn');
    fireEvent.click(deleteButtons[0]);
    
    // Force an invalid state through the API
    api.delete.mockRejectedValueOnce(new Error('Invalid organization ID'));
    
    const confirmButton = screen.getByText('Delete');
    await act(async () => {
        fireEvent.click(confirmButton);
    });

    expect(screen.getByText('Failed to delete organization')).toBeInTheDocument();
});
  
  it('handles delete error without error message', async () => {
      api.delete.mockRejectedValueOnce(new Error());
      
      render(
          <BrowserRouter>
              <ViewOrganisations />
          </BrowserRouter>
      );
  
      await waitFor(() => {
          const deleteButtons = screen.getAllByTestId('delete-btn');
          fireEvent.click(deleteButtons[0]);
      });
  
      const confirmButton = screen.getByText('Delete');
      await act(async () => {
          fireEvent.click(confirmButton);
      });
  
      expect(screen.getByText('Failed to delete organization')).toBeInTheDocument();
  });
  
  it('handles update error without error message', async () => {
      api.put.mockRejectedValueOnce(new Error());
  
      render(
          <BrowserRouter>
              <ViewOrganisations />
          </BrowserRouter>
      );
  
      await waitFor(() => {
          const editButtons = screen.getAllByTestId('edit-btn');
          fireEvent.click(editButtons[0]);
      });
  
      const saveButton = screen.getByText('💾');
      await act(async () => {
          fireEvent.click(saveButton);
      });
  
      expect(screen.getByText('Failed to update organization')).toBeInTheDocument();
  });
  
  it('clears status message after timeout', async () => {
      jest.useFakeTimers();
      
      render(
          <BrowserRouter>
              <ViewOrganisations />
          </BrowserRouter>
      );
  
      await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
  
      // Trigger a status message
      const editButtons = screen.getAllByTestId('edit-btn');
      fireEvent.click(editButtons[0]);
      fireEvent.click(editButtons[1]);
  
      expect(screen.getByText('Another edit operation is in progress. Please wait.')).toBeInTheDocument();
  
      // Fast-forward time
      act(() => {
          jest.advanceTimersByTime(5000);
      });
  
      expect(screen.queryByText('Another edit operation is in progress. Please wait.')).not.toBeInTheDocument();
  
      jest.useRealTimers();
  });
});