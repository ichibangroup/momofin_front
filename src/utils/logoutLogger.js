import * as Sentry from "@sentry/react";

export const LogoutActivityLogger = {
  logLogoutAttempt: (userId, organizationId) => {
    Sentry.addBreadcrumb({
      category: 'auth',
      message: `Logout attempt for user ${userId} from organization ${organizationId}`,
      level: 'info',
    });
  },

  logLogoutSuccess: (userId, organizationId, username) => {
    Sentry.captureMessage(`Successful logout: ${username} (${organizationId})`, 'info');
    // Clear user context from Sentry
    Sentry.setUser(null);
  },

  logLogoutFailure: (userId, organizationId, error) => {
    Sentry.captureException(error, {
      extra: {
        userId,
        organizationId,
        errorMessage: error.message,
      },
      tags: {
        action: 'logout_failure'
      }
    });
  },

  logNavigationAfterLogout: (from, to) => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Post-logout navigation from ${from} to ${to}`,
      level: 'info',
    });
  }
};