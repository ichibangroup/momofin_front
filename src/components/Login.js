import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import { validateLogin } from './LoginValidation';
import '../Login.css';
import api from '../utils/api';
import { LoginActivityLogger } from '../utils/loginLogger';
import { setAuthToken } from '../utils/auth';
import logoAvento from '../assets/logo-avento.png';
import { Building, User, Lock } from 'lucide-react';
import { sanitizePlainText, sanitizeFormData } from '../utils/sanitizer'; // Add this import

function Login({ onSubmit }) {
  const [organizationName, setOrganizationName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState('');
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Sanitize URL parameters
    const urlMessage = searchParams.get('message');
    if (urlMessage) {
      setAuthMessage(sanitizePlainText(decodeURIComponent(urlMessage)));
    }
    // Sanitize navigation state message
    else if (location.state?.message) {
      setAuthMessage(sanitizePlainText(location.state.message));
    }
  }, [location, searchParams]);

  const handleInputChange = (setter) => (e) => {
    const sanitizedValue = sanitizePlainText(e.target.value);
    setter(sanitizedValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthMessage('');

    // Create payload with current values
    const payload = {
      organizationName,
      username,
      password,
    };

    // Sanitize the payload
    const sanitizedPayload = sanitizeFormData(payload);

    LoginActivityLogger.logLoginAttempt(sanitizedPayload.username, sanitizedPayload.organizationName);

    // Perform validation with sanitized data
    const validationErrors = validateLogin({
      username: sanitizedPayload.username,
      password: sanitizedPayload.password
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      LoginActivityLogger.logLoginFailure(
        sanitizedPayload.username, 
        sanitizedPayload.organizationName, 
        new Error('Validation failed')
      );
      return;
    }

    try {
      setAuthToken();
      const response = await api.post('/auth/login', sanitizedPayload);
      const { jwt } = response.data;
      setAuthToken(jwt);

      if (response.status >= 200 && response.status < 300) {
        // Log successful login
        LoginActivityLogger.logLoginSuccess(
          sanitizedPayload.username, 
          sanitizedPayload.organizationName
        );

        console.log('Login successful:', response.data);
        if (onSubmit) {
          onSubmit(response.data);
        }
        const redirectTo = location.state?.from || '/app';
        
        // Log navigation redirect
        LoginActivityLogger.logNavigationRedirect(
          location.pathname,
          redirectTo
        );

        navigate(redirectTo);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Log login failure
      LoginActivityLogger.logLoginFailure(
        sanitizedPayload.username, 
        sanitizedPayload.organizationName, 
        error
      );

      if (error.response?.data?.errorMessage) {
        setErrors({ 
          server: sanitizePlainText(error.response.data.errorMessage) 
        });
      } else {
        setErrors({ 
          server: sanitizePlainText('Login failed. Please try again.') 
        });
      }
    }
  };

  return (
    <><script async src="https: //www.googletagmanager.com/gtag/js?id=G-L69JY6PF8K"></script>
    <script
      dangerouslySetInnerHTML = {{
      __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push (arguments);}
      gtag('js', new Date());
      gtag('config', 'G-L69JY6PF8K');`,
      }}
    /><div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="header-container">
            <h2>Sign In</h2>
            <img src={logoAvento} alt="Logo Avento" style={{ width: '100px', height: 'auto' }} className="login-logo" />
          </div>
          <div className="input-group">
            <Building className="input-icon" />
            <input
              type="text"
              id="organizationName"
              placeholder="Organization Name"
              value={organizationName}
              onChange={handleInputChange(setOrganizationName)}
              required />
            {errors.organizationName &&
              <span className="error">
                {sanitizePlainText(errors.organizationName)}
              </span>}
          </div>
          <div className="input-group">
            <User className="input-icon" />
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={handleInputChange(setUsername)}
              required />
            {errors.username &&
              <span className="error">
                {sanitizePlainText(errors.username)}
              </span>}
          </div>
          <div className="input-group">
            <Lock className="input-icon" />
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={handleInputChange(setPassword)}
              required />
            {errors.password &&
              <span className="error">
                {sanitizePlainText(errors.password)}
              </span>}
          </div>
          {errors.server &&
            <span className="error">
              {sanitizePlainText(errors.server)}
            </span>}
          {authMessage && (
            <div className="auth-message">
              {sanitizePlainText(authMessage)}
            </div>
          )}
          <button className="signin-button" type="submit">Sign In</button>
          <Link to="/forgot-password" className="forgot-password">
            Forgot Password?
          </Link>
        </form>
      </div></>
  );
}

export default Login;