export const validateUserProfile = (user) => {
  const errors = {};

  if (!user.username || user.username.trim() === '') {
    errors.username = 'Username is required';
  }

  if (user.email === undefined || user.email === null || (typeof user.email === 'string' && user.email.trim() === '')) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(user.email)) {
    errors.email = 'Email is invalid';
  }

  // Basic password validation
  if (user.oldPassword && !user.newPassword) {
    errors.newPassword = 'New password is required when changing password';
  }

  if (user.newPassword && !user.oldPassword) {
    errors.oldPassword = 'Old password is required when changing password';
  }

  return errors;
};

function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  if (email.length > 254) return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;

  if (local.length > 64 || domain.length > 253) return false;
  if (!domain.includes('.')) return false;

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}