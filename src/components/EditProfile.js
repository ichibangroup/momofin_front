import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const FormField = ({ label, id, name, type = 'text', value, onChange }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
    />
  </div>
);

const EditProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', email: '', oldPassword: '', newPassword: '' });
  const [error, setError] = useState(null);

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
        setError('Failed to fetch user data. Please try again.');
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
    try {
      await api.put(`/api/user/profile/${userId}`, user);
      navigate('/app');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-profile">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <FormField label="Username:" id="username" name="username" value={user.username} onChange={handleInputChange} />
        <FormField label="Email:" id="email" name="email" type="email" value={user.email} onChange={handleInputChange} />
        <FormField label="Old Password:" id="oldPassword" name="oldPassword" type="password" value={user.oldPassword} onChange={handleInputChange} />
        <FormField label="New Password:" id="newPassword" name="newPassword" type="password" value={user.newPassword} onChange={handleInputChange} />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;