import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from './components/ThemeContext';
import App from './App';

test('renders App without crashing', () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
});