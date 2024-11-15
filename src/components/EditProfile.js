
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { validateUserProfile } from '../utils/validationUtils';
import { sanitizePlainText } from '../utils/sanitizer';
import './EditProfile.css';
import { setAuthToken } from "../utils/auth";

const FormFieldWithTooltip = ({ 
  label, 
  id, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error,
  tooltipText 
}) => (
  <div className="form-field">
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className="input-tooltip-container">
      <input
        className="form-input"
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />
      {tooltipText && (
        <div className="tooltip">
          <div className="tooltip-content">
            {tooltipText}
          </div>
        </div>
      )}
    </div>
    {error && <span className="form-error">{error}</span>}
  </div>
);

const FormField = ({ label, id, name, type = 'text', value, onChange, error }) => (
  <div className="form-field">
    <label className="form-label" htmlFor={id}>{label}</label>
    <input
      className="form-input"
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
    />
    {error && <span className="form-error">{error}</span>}
  </div>
);

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    name: '',
    position: '',
  });
  const [originalUsername, setOriginalUsername] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReauthAlert, setShowReauthAlert] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isNotLoggedUser, setIsNotLoggedUser] = useState(false);

  useEffect(() => {
    const fetchLoggedInUserInfo = async () => {
        try {
            const response = await api.get('/auth/info');
            if (!response.data) {
                // Handle case where no user data is returned
                setAuthToken(); // Set the auth token (clear if needed)
                navigate('/login');
                return;
            }
            setLoggedInUser(response.data);
            if (userId !== response.data.userId) {
              setIsNotLoggedUser(true);
            }
        } catch (err) {
            setAuthToken(); // Set the auth token (clear if needed)
            navigate('/login');
        }
    };

    fetchLoggedInUserInfo();
}, [navigate, userId]);

  const checkIfAdmin = (userData) => {
    return userData.momofinAdmin || 
           userData.organizationAdmin || 
           userData.roles?.includes('ROLE_MOMOFIN_ADMIN') || 
           userData.roles?.includes('ROLE_ORG_ADMIN');
  };

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await api.get(`/api/user/profile/${userId}`);
      const userData = response.data;
      setIsAdmin(checkIfAdmin(userData));
      setOriginalUsername(userData.username);
      setUser(prevUser => ({
        ...prevUser,
        username: userData.username,
        email: userData.email,
        name: userData.name || '',
        position: userData.position || '',
      }));
    } catch (error) {
      setApiError('Failed to fetch user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const updateUserProfile = async () => {
    try {
      setApiError(null);
      
      const isUsernameChanged = user.username !== originalUsername;
      console.log('isNotLoggedUser', isNotLoggedUser);
      console.log(loggedInUser.userId, userId);
      
      if (isUsernameChanged) {
        setShowReauthAlert(true);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const sanitizedPayload = {
        username: sanitizePlainText(user.username),
        email: sanitizePlainText(user.email),
        ...(isAdmin && {
          name: sanitizePlainText(user.name),
          position: sanitizePlainText(user.position),
        }),
      };
      if (isNotLoggedUser) {
        await api.put(`/api/user/profile/${userId}`, sanitizedPayload, {
          params: {
            oldPassword: user.oldPassword,
            newPassword: user.newPassword,
          },
        });
        navigate('/app/viewAllUsers');
      }else{
        await api.put(`/api/user/profile/${userId}`, sanitizedPayload, {
          params: {
            oldPassword: user.oldPassword,
            newPassword: user.newPassword,
          },
        });
  
        if (isUsernameChanged) {
          navigate('/login', { 
            state: { 
              message: 'Your username has been updated. Please login again with your new username.',
              username: user.username
            } 
          });
        } else {
          navigate('/app');
        }
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update profile. Please try again.');
      setShowReauthAlert(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizePlainText(value);
    setUser(prevUser => ({ ...prevUser, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateUserProfile(user);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      await updateUserProfile();
    }
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (apiError) {
    return (
      <div className="error-container">
        <div className="error-message">{apiError}</div>
        <button onClick={fetchUserData} className="button button-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      {showReauthAlert && !isNotLoggedUser && (
        <div className="alert alert-info">
          Changing your username will require you to login again.
        </div>
      )}
      <div className="decorative-lines"></div>
      <div className="edit-profile-content">
        {isNotLoggedUser &&
          <h1 className="page-title">Edit User</h1>
        } { !isNotLoggedUser &&
          <h1 className="page-title">Edit Profile</h1>
        }
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            {isAdmin && (
              <FormField
                label="Name"
                id="name"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                error={errors.name}
              />
            )}
            <FormFieldWithTooltip
              label="Username"
              id="username"
              name="username"
              value={user.username}
              onChange={handleInputChange}
              error={errors.username}
              tooltipText="Changing your username will require you to login again"
            />
          </div>
          <div className="form-row">
            {isAdmin && (
              <FormField
                label="Position"
                id="position"
                name="position"
                value={user.position}
                onChange={handleInputChange}
                error={errors.position}
              />
            )}
            <FormField
              label="Email"
              id="email"
              name="email"
              type="email"
              value={user.email}
              onChange={handleInputChange}
              error={errors.email}
            />
          </div>
          <div className="password-section">
            <FormField
              label="Old Password"
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={user.oldPassword}
              onChange={handleInputChange}
              error={errors.oldPassword}
            />
            <FormField
              label="New Password"
              id="newPassword"
              name="newPassword"
              type="password"
              value={user.newPassword}
              onChange={handleInputChange}
              error={errors.newPassword}
            />
          </div>
          <div className="button-container">
            {isNotLoggedUser && (
              <button type="button" onClick={() => navigate('/app/viewAllUsers')} className="button button-secondary">
                Cancel
              </button>
            )}
            {!isNotLoggedUser && (
              <button type="button" onClick={() => navigate('/app')} className="button button-secondary">
                Cancel
              </button>
            )}
            <button type="submit" className="button button-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
