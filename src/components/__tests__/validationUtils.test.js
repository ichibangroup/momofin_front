import { validateUserProfile } from '../../utils/validationUtils';

describe('validateUserProfile', () => {
  test('returns no errors for valid input', () => {
    const user = {
      username: 'validuser',
      email: 'valid@email.com',
      oldPassword: 'oldpass',
      newPassword: 'newpass'
    };
    expect(validateUserProfile(user)).toEqual({});
  });

  test('returns error for empty username', () => {
    const user = { username: '', email: 'valid@email.com' };
    const errors = validateUserProfile(user);
    expect(errors.username).toBe('Username is required');
  });

  test('returns error for empty email', () => {
    const user = { username: 'validuser', email: '' };
    const errors = validateUserProfile(user);
    expect(errors.email).toBe('Email is required');
  });

  test('returns error for invalid email', () => {
    const user = { username: 'validuser', email: 'invalidemail' };
    const errors = validateUserProfile(user);
    expect(errors.email).toBe('Email is invalid');
  });

  test('returns error when only oldPassword is provided', () => {
    const user = { username: 'validuser', email: 'valid@email.com', oldPassword: 'oldpass' };
    const errors = validateUserProfile(user);
    expect(errors.newPassword).toBe('New password is required when changing password');
  });

  test('returns error when only newPassword is provided', () => {
    const user = { username: 'validuser', email: 'valid@email.com', newPassword: 'newpass' };
    const errors = validateUserProfile(user);
    expect(errors.oldPassword).toBe('Old password is required when changing password');
  });

  test('returns no errors when both passwords are provided', () => {
    const user = {
      username: 'validuser',
      email: 'valid@email.com',
      oldPassword: 'oldpass',
      newPassword: 'newpass'
    };
    expect(validateUserProfile(user)).toEqual({});
  });

  test('returns multiple errors for multiple invalid fields', () => {
    const user = { username: '', email: 'invalidemail', oldPassword: 'oldpass' };
    const errors = validateUserProfile(user);
    expect(errors).toEqual({
      username: 'Username is required',
      email: 'Email is invalid',
      newPassword: 'New password is required when changing password'
    });
  });
});