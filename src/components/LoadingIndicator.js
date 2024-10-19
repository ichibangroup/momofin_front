import React from 'react';

const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-full" data-testid="loading-indicator">
    <div
      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      data-testid="spinner"
      role="status"
      aria-label="Loading"
    />
  </div>
);

export default LoadingIndicator;