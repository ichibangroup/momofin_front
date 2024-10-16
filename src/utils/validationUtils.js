export const validateUserProfile = (user) => {
    const errors = {};
    if (!user.username.trim()) errors.username = 'Username is required';
    if (!user.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(user.email)) errors.email = 'Invalid email format';
    if (!user.oldPassword.trim()) errors.oldPassword = 'Old password is required';
    return errors;
  };