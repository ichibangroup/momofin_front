import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from './components/ThemeContext';
import App from './App';

test('renders App without crashing', async () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  
  await waitFor(() => {
    // Check for the navigation element
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});