import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateLogin } from './LoginValidation';
import '../Login.css';
import api from '../utils/api';
import { setAuthToken } from '../utils/auth';

function Login({ onSubmit }) {
  const [organizationName] = useState("Momofin"); // Static organization name
  const [username, setUsername] = useState(''); // State for username
  const [password, setPassword] = useState(''); // State for password
  const [errors, setErrors] = useState({}); // State for error messages
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    console.log("Submit button clicked"); // Debugging line
    event.preventDefault();
    console.log("Submit button clicked 2");

    // Perform validation
    const validationErrors = validateLogin({ username, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("Submit button clicked 3");

    // Prepare the payload to match your backend's expected format
    const payload = {
      organizationName,
      username, // Using username from input
      password,
    };

    console.log('Payload:', payload); // Debugging line

    try {
      // Send POST request to your backend
      const response = await api.post('/auth/login', { organizationName, username, password });
      const { jwt } = response.data;
      setAuthToken(jwt);

      console.log('Response status:', response.status); // Debugging line
      console.log(response.status)

      if (response.status < 200 || response.status > 300) {
        throw new Error('Login failed');
      }

      const data = await response.data;
      console.log('Login successful:', data);

      // Optional: Call the onSubmit callback or navigate based on the response
      if (onSubmit) {
        onSubmit(data);
      }

      // Example: Navigate to a dashboard page after successful login
      navigate('/app');

    } catch (error) {
      console.error('Error:', error);
      setErrors({ server: 'Login failed. Please try again.' });
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
      <div className="login-container">
        <div className="login-form-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Sign In</h2>
            <div className="form-group">
              <input
                  type="text" // Input type for username
                  id="username" // ID for username input
                  placeholder="Username" // Placeholder for username
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} // Update username state
                  required
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <input
                  type="password"
                  id="password"
                  placeholder="Password" // Placeholder for password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update password state
                  required
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>
            {errors.server && <span className="error">{errors.server}</span>}
            <button type="submit" className="btn-signin">Sign In</button>
            <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
          </form>
        </div>
        <div className="login-welcome-container">
          <h2>Welcome Back!</h2>
          <p>Enter your personal details or Sign Up if you don't have an account</p>
          <button className="btn-signup" onClick={handleSignUp}>Sign Up</button>
        </div>
      </div>
  );
}

export default Login;
