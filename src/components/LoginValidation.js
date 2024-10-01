export const validateLogin = ({ username, password }) => {
    let validationErrors = {};
    
    if (!username) {
      validationErrors.email = 'Username is required';
    }
  
    if (!password) {
      validationErrors.password = 'Password is required';
    }
  
    return validationErrors;
  };
  