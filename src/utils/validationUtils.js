export const validateUserProfile = (user) => {
    const errors = {};
  
    if (!user.username || user.username.trim() === '') {
      errors.username = 'Username is required';
    }
  
    if (!user.email || user.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
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