import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validateLogin } from './LoginValidation'; 
import '../Login.css';

function Login({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); 

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateLogin({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (onSubmit) {
      onSubmit({ email, password });
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
              type="email"
              id="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
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
