import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ViewUsers from '../ViewAllUsers'; // Adjust the import path as necessary
import api from "../../utils/api";
import '@testing-library/jest-dom';

const mockUsers = [
    {
      id: 1,
      name: 'Galih Ibrahim Kurniawan',
      username: 'Sirered',
      organization: 'ICHIBAN GROUP',
      email: 'emailme@example.com',
      avatar: 'https://randomuser.me/api/portraits/men/79.jpg'
    }
  ];
  jest.mock('../../utils/api');
// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockUsers),
  })
);

describe('ViewUsers Component', () => {
    beforeEach(() => {
        fetch.mockClear(); // Clear the mock before each test
    
        api.get.mockResolvedValue({
          data: mockUsers,
          status: 200
        });
      });
    test('renders without crashing', () => {
        render(<ViewUsers />);
        expect(screen.getByText('View All Users')).toBeInTheDocument();
    });

    test('displays headers correctly', () => {
        render(<ViewUsers />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Organisation')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('has functional add users button', () => {
        render(<ViewUsers />);
        expect(screen.getByText('ADD USERS')).toBeInTheDocument();
    });
    test('handles fetch failure gracefully', async () => {
        api.get.mockRejectedValue({
          response: {
            status: 404,
            data: { message: 'Users not found' }
          }
        });
    
        render(<ViewUsers />);
    
        // Ensure the fetch was called
        await expect(api.get('/api/momofin-admin/users'))
            .rejects
            .toMatchObject({
              response: {
                status: 404,
                data: { message: 'Users not found' }
              }
            });
    
        // Since no error handling UI is implemented, we only check if the table is still rendered
        expect(screen.getByTestId('viewUsers-1')).toBeInTheDocument();
      });
      test('renders the ViewUsers component correctly', async () => {

        render(<ViewUsers />);
    
        // Check if the title renders
        expect(screen.getByText('View All Users')).toBeInTheDocument();
    
        // Ensure the fetch is called once
        await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1));
    
        // Check if the user data is rendered correctly
        await waitFor(() => {
          expect(screen.getByText('Galih Ibrahim Kurniawan')).toBeInTheDocument();
          expect(screen.getByText('Sirered')).toBeInTheDocument();
          expect(screen.getByText('ICHIBAN GROUP')).toBeInTheDocument();
          expect(screen.getByText('emailme@example.com')).toBeInTheDocument();
        });
      });
});
