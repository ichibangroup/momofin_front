import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import App from './App';

test('renders App without crashing', async () => {
  await act(async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>
    );
  });
  
  // Add an assertion to check for some content
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});