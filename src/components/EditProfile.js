import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { validateUserProfile } from '../utils/validationUtils';

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/api/user/profile/${userId}`);
        setUser(prevUser => ({
          ...prevUser,
          username: response.data.username,
          email: response.data.email
        }));
      } catch (error) {
        setApiError('Failed to fetch user data. Please try again.');
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateUserProfile(user);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        await api.put(`/api/user/profile/${userId}`, user, {
          params: { oldPassword: user.oldPassword, newPassword: user.newPassword }
        });
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
          error={errors.newPassword}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;