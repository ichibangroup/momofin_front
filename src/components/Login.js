import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateLogin } from './LoginValidation';
import '../Login.css';
import api from '../utils/api';
import { setAuthToken } from '../utils/auth';

function Login({ onSubmit }) {
  const [organizationName, setOrganizationName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform validation
    const validationErrors = validateLogin({ username, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      organizationName,
      username,
      password,
    };

    try {
      const response = await api.post('/auth/login', payload);
      const { jwt } = response.data;
      setAuthToken(jwt);

      if (response.status >= 200 && response.status < 300) {
        console.log('Login successful:', response.data);
        if (onSubmit) {
          onSubmit(response.data);
        }
        navigate('/app');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data && error.response.data.errorMessage) {
        setErrors({ server: error.response.data.errorMessage });
      } else {
        setErrors({ server: 'Login failed. Please try again.' });
      }
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
                  type="text"
                  id="organizationName"
                  placeholder="Organization Name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
              />
              {errors.organizationName && <span className="error">{errors.organizationName}</span>}
            </div>
            <div className="form-group">
              <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>
            <div className="form-group">
              <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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