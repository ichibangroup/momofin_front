import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

// Mock the api module
jest.mock('../../utils/api', () => ({
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Mock the components that are lazily loaded
jest.mock('../components/Home', () => () => <div>Home Component</div>, { virtual: true });
jest.mock('../components/Login', () => () => <div>Login Component</div>, { virtual: true });

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <App />
    );
    // If it renders without crashing, this test will pass
  });

  test('redirects to login for root path', () => {
    render(
        <App />
    );
    // This might fail if there's a delay in redirection. You might need to use `waitFor` from @testing-library/react
    expect(screen.getByText('Sign In', { selector: 'h2' })).toBeInTheDocument();
  });

  // Add more tests for other routes if needed
});