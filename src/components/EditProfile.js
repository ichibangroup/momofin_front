import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { validateUserProfile } from '../utils/validationUtils';
import { sanitizePlainText } from '../utils/sanitizer'; 

const FormField = ({ label, id, name, type = 'text', value, onChange, error }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
      />
      {error && <span className="error">{error}</span>}
    </div>
);

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', email: '', oldPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await api.get(`/api/user/profile/${userId}`);
      setUser(prevUser => ({
        ...prevUser,
        username: response.data.username,
        email: response.data.email
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
      // Sanitize the payload before sending
      const sanitizedPayload = {
        username: sanitizePlainText(user.username),
        email: sanitizePlainText(user.email),
      };

      await api.put(`/api/user/profile/${userId}`, sanitizedPayload, {
        params: {
          oldPassword: user.oldPassword,
          newPassword: user.newPassword,
        },
      });
      navigate('/app');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Sanitize the input value as it changes
    const sanitizedValue = sanitizePlainText(value);
    setUser(prevUser => ({ ...prevUser, [name]: sanitizedValue }));
    // Clear error for the field being changed
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
    return <div className="loading">Loading...</div>;
  }

  if (apiError) {
    return (
        <div className="error-container">
          <div className="error">{apiError}</div>
          <button onClick={fetchUserData} className="retry-button">
            Retry
          </button>
        </div>
    );
  }

  return (
      <div className="edit-profile">
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <FormField
              label="Username:"
              id="username"
              name="username"
              value={user.username}
              onChange={handleInputChange}
              error={errors.username}
          />
          <FormField
              label="Email:"
              id="email"
              name="email"
              type="email"
              value={user.email}
              onChange={handleInputChange}
              error={errors.email}
          />
          <FormField
              label="Old Password:"
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={user.oldPassword}
              onChange={handleInputChange}
              error={errors.oldPassword}
          />
          <FormField
              label="New Password:"
              id="newPassword"
              name="newPassword"
              type="password"
              value={user.newPassword}
              onChange={handleInputChange}
              error={errors.newPassword}
          />
          <button type="submit">Save Changes</button>
        </form>
      </div>
  );
};

export default EditProfile;
