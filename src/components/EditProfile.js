import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            name="username"
            value={user.username}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            value={user.email}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="oldPassword">Old Password:</label>
          <input
            id="oldPassword"
            name="oldPassword"
            type="password"
            value={user.oldPassword}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="newPassword">New Password:</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={user.newPassword}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;