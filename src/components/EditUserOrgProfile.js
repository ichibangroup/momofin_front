import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { sanitizeFormData } from '../utils/sanitizer';
import './EditUserOrgProfile.css';

const FormField = ({ label, id, name, type = 'text', value, onChange }) => (
  <div className="form-field">
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <input
      className="form-input"
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
    />
  </div>
);

const EditUserOrgProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    position: '',
  });
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/api/user/profile/${userId}`);
        console.log(response.data);
        const sanitizedData = sanitizeFormData(response.data);
        setFormData({
          username: sanitizedData.username,
          email: sanitizedData.email,
          name: sanitizedData.name || '',
          position: sanitizedData.position || '',
        });
      } catch (error) {
        setApiError('Failed to fetch user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedData = sanitizeFormData(formData);

    try {
      await api.put(`/api/user/profile/${userId}`, sanitizedData);
      navigate('/app');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (apiError) {
    return (
      <div className="error-container">
        <div className="error-message">{apiError}</div>
        <button onClick={() => setApiError(null)} className="button button-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="decorative-lines"></div>
      <div className="edit-profile-content">
        <h1 className="page-title">Edit User Organisation Profile</h1>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <FormField
              label="Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <FormField
              label="Username"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <FormField
              label="Position"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
            <FormField
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="button-container">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="button button-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserOrgProfile;