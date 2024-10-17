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

  test('accepts valid email addresses', () => {
    const validEmails = [
      'simple@example.com',
      'very.common@example.com',
      'disposable.style.email.with+symbol@example.com',
      'other.email-with-hyphen@example.com',
      'fully-qualified-domain@example.com',
      'user.name+tag+sorting@example.com',
      'x@example.com',
      'example-indeed@strange-example.com',
      'example@s.example',
    ];

    validEmails.forEach(email => {
      const result = validateUserProfile({ username: 'validuser', email });
      expect(result.email).toBeUndefined();
    });
  });

  test('rejects invalid email addresses', () => {
    const invalidEmails = [
      'Abc.example.com',
      'A@b@c@example.com',
      'a"b(c)d,e:f;g<h>i[j\k]l@example.com',
      'just"not"right@example.com',
      'this is"not\allowed@example.com',
      'this\ still\"not\\allowed@example.com',
      '1234567890123456789012345678901234567890123456789012345678901234+x@example.com',
      'i_like_underscore@but_its_not_allowed_in_this_part.example.com',
      'a'.repeat(65) + '@example.com', // local part too long
      'test@' + 'a'.repeat(254) + '.com', // domain part too long
      'test@example' // no dot in domain
    ];

    invalidEmails.forEach(email => {
      const result = validateUserProfile({ username: 'validuser', email });
      expect(result.email).toBe('Email is invalid');
    });
  });
});