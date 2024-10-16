import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

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

  // ... (previous useEffect and handleInputChange remain the same)

  const validateForm = () => {
    const newErrors = {};
    if (!user.username.trim()) newErrors.username = 'Username is required';
    if (!user.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(user.email)) newErrors.email = 'Invalid email format';
    if (!user.oldPassword.trim()) newErrors.oldPassword = 'Old password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await api.put(`/api/user/profile/${userId}`, user);
        navigate('/app');
      } catch (error) {
        setApiError(error.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    }
  };

  if (apiError) return <div className="error">{apiError}</div>;

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
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;