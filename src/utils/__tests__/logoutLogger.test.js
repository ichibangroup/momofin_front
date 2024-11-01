// src/utils/__tests__/logoutLogger.test.js
import { LogoutActivityLogger } from '../logoutLogger';
import * as Sentry from '@sentry/react';

jest.mock('@sentry/react');

describe('LogoutActivityLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear any previous mocks
  });

  test('logs logout attempt', () => {
    const userId = '123';
    const organizationId = '456';

    LogoutActivityLogger.logLogoutAttempt(userId, organizationId);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'auth',
      message: `Logout attempt for user ${userId} from organization ${organizationId}`,
      level: 'info',
    });
  });

  test('logs successful logout', () => {
    const userId = '123';
    const organizationId = '456';
    const username = 'testUser';

    LogoutActivityLogger.logLogoutSuccess(userId, organizationId, username);

    expect(Sentry.captureMessage).toHaveBeenCalledWith(`Successful logout: ${username} (${organizationId})`, 'info');
    expect(Sentry.setUser).toHaveBeenCalledWith(null);
  });

  test('logs logout failure', () => {
    const userId = '123';
    const organizationId = '456';
    const error = new Error('Logout failed');

    LogoutActivityLogger.logLogoutFailure(userId, organizationId, error);

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: {
        userId,
        organizationId,
        errorMessage: error.message,
      },
      tags: {
        action: 'logout_failure',
      },
    });
  });

  test('logs navigation after logout', () => {
    const from = '/app';
    const to = '/login';

    LogoutActivityLogger.logNavigationAfterLogout(from, to);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'navigation',
      message: `Post-logout navigation from ${from} to ${to}`,
      level: 'info',
    });
  });
});
