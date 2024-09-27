import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Login.css';

const Login = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      navigate('/app');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>
          <div className="form-group">
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
          </div>
          <button type="submit" className="btn-signin">Login</button>
          <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
        </form>
      </div>
      <div className="login-welcome-container">
        <h2>Welcome Back!</h2>
        <p>Don't have an account? <Link to="/register" className="btn-signup">Register Here!</Link></p>
      </div>
    </div>
  );
};

export default Login;