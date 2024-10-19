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

  test('rejects non-string email values', () => {
    const nullUndefinedValues = [null, undefined];
    const otherNonStringValues = [123, {}, [], true, false, () => {}];

    nullUndefinedValues.forEach(value => {
      const result = validateUserProfile({ username: 'validuser', email: value });
      expect(result.email).toBe('Email is required');
    });

    otherNonStringValues.forEach(value => {
      const result = validateUserProfile({ username: 'validuser', email: value });
      expect(result.email).toBe('Email is invalid');
    });
  });

  test('rejects email addresses that are too long', () => {
    const longEmail = 'a'.repeat(255) + '@example.com';
    const result = validateUserProfile({ username: 'validuser', email: longEmail });
    expect(result.email).toBe('Email is invalid');
  });

  test('rejects email addresses with local part too long', () => {
    const longLocalPart = 'a'.repeat(65) + '@example.com';
    const result = validateUserProfile({ username: 'validuser', email: longLocalPart });
    expect(result.email).toBe('Email is invalid');
  });

  test('rejects email addresses with domain part too long', () => {
    const longDomainPart = 'user@' + 'a'.repeat(254) + '.com';
    const result = validateUserProfile({ username: 'validuser', email: longDomainPart });
    expect(result.email).toBe('Email is invalid');
  });

  test('rejects email addresses without a dot in the domain', () => {
    const noDotDomain = 'user@examplecom';
    const result = validateUserProfile({ username: 'validuser', email: noDotDomain });
    expect(result.email).toBe('Email is invalid');
  });
});