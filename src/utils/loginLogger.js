import * as Sentry from "@sentry/react";

export const LoginActivityLogger = {
  logLoginAttempt: (username, organizationName) => {
    Sentry.addBreadcrumb({
      category: 'auth',
      message: `Login attempt for user ${username} from organization ${organizationName}`,
      level: 'info',
    });
  },

  logLoginSuccess: (username, organizationName) => {
    Sentry.captureMessage(`Successful login: ${username} (${organizationName})`, 'info');
    Sentry.setUser({
      username: username,
      organization: organizationName,
    });
  },

  logLoginFailure: (username, organizationName, error) => {
    Sentry.captureException(error, {
      extra: {
        username,
        organizationName,
        errorMessage: error.message,
      },
      tags: {
        action: 'login_failure'
      }
    });
  },

  logNavigationRedirect: (from, to) => {
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Login redirect from ${from} to ${to}`,
      level: 'info',
    });
  }
};