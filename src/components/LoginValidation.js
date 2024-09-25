export const validateLogin = ({ email, password }) => {
    let validationErrors = {};
    
    if (!email) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = 'Email address is invalid';
    }
  
    if (!password) {
      validationErrors.password = 'Password is required';
    }
  
    return validationErrors;
  };
  