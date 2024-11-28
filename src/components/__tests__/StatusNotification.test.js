import React from 'react';
import { render } from '@testing-library/react';
import StatusNotification from '../StatusNotification';

describe('StatusNotification', () => {
  it('renders nothing when message is empty', () => {
    const { container } = render(
      <StatusNotification message="" type="success" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders success message with correct styling', () => {
    const { container } = render(
      <StatusNotification message="Success message" type="success" />
    );
    const notification = container.firstChild;
    expect(notification).toHaveClass('status-notification', 'status-success');
    expect(notification).toHaveTextContent('Success message');
  });

  it('renders error message with correct styling', () => {
    const { container } = render(
      <StatusNotification message="Error message" type="error" />
    );
    const notification = container.firstChild;
    expect(notification).toHaveClass('status-notification', 'status-error');
    expect(notification).toHaveTextContent('Error message');
  });
});
