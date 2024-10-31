import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewOrganisations from '../ViewOrg'; 
import api from "../../utils/api";

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockOrganisations = [{
    id: 1,
    name: 'Organization 1',
    industry: 'Technology',
    location: '123 Main St, City, State, Country',
    description: 'This is a long description about Organization 1. It provides technology solutions.',
},
{
    id: 2,
    name: 'Organization 2',
    industry: 'Healthcare',
    location: '456 Oak St, City, State, Country',
    description: 'This is a shorter description for Organization 2.',
},
{
    id: 3,
    name: 'Organization 3',
    industry: 'Entertainment',
    location: 'Depok City',
    description: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
},]
jest.mock('../../utils/api');
// Mock the fetch function
global.fetch = jest.fn();

describe('ViewOrganisations Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    
        // Setup the api.get mock with the default successful response
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
        });
    
        await waitFor(() => {
          expect(screen.getByText('Organization 1')).toBeInTheDocument();
          expect(screen.getByText('Technology')).toBeInTheDocument();
          expect(screen.getByText('123 Main St, City, State, Country')).toBeInTheDocument();
          expect(screen.getByText('This is a long description about Organization 1. It provides technology solutions.')).toBeInTheDocument();
    
          expect(screen.getByText('Organization 2')).toBeInTheDocument();
          expect(screen.getByText('Healthcare')).toBeInTheDocument();
          expect(screen.getByText('456 Oak St, City, State, Country')).toBeInTheDocument();
          expect(screen.getByText('This is a shorter description for Organization 2.')).toBeInTheDocument();
        })
      });
    
    
      it('displays edit and delete buttons for each organization', async () => {
        render(
          <BrowserRouter>
            <ViewOrganisations />
          </BrowserRouter>
        );
    
        await waitFor(() => {
          expect(api.get).toHaveBeenCalledWith('/api/momofin-admin/organizations');
    
          const editButtons = screen.getAllByTestId("edit-btn");
          const deleteButtons = screen.getAllByTestId("delete-btn");
    
          expect(editButtons).toHaveLength(3);
          expect(deleteButtons).toHaveLength(3);
        });
      });
    
      it('navigates to add new organisation page when "Add Organisation" button is clicked', () => {
        render(
          <BrowserRouter>
            <ViewOrganisations />
          </BrowserRouter>
        );
    
        fireEvent.click(screen.getByText('ADD ORGANISATION'));
        expect(mockNavigate).toHaveBeenCalledWith('/app/momofinDashboard/addNewOrganisation');
      });
    
      it('handles API fetch error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        api.get.mockImplementationOnce(() => Promise.reject(new Error('API Error')));
    
        render(
          <BrowserRouter>
            <ViewOrganisations />
          </BrowserRouter>
        );
    
        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith('Error fetching organizations:', expect.any(Error));
        });
    
        consoleSpy.mockRestore();
      });

});
