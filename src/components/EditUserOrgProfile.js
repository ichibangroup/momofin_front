import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const EditUserOrgProfile = () => {
  const  { userId } = useParams();
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
        console.log(response.data)
        setFormData({
          username: response.data.username,
          email: response.data.email,
          name: response.data.name || '',
          position: response.data.position || '',
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
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/user/profile/${userId}`, formData);
      navigate('/app');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (apiError) {
    return (
        <div className="error-container">
          <div className="error">{apiError}</div>
          <button onClick={() => setApiError(null)} className="retry-button">
            Retry
          </button>
        </div>
    );
  }

  return (
    <div className="edit-user-org-profile">
      <h1>Edit User Organisation Profile</h1>
      <form onSubmit={handleSubmit}>
        {['username', 'email', 'name', 'position'].map((field) => (
          <div key={field}>
            <label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1')}: </label>
            <input
              id={field}
              name={field}
              type="text"
              value={formData[field]}
              onChange={handleChange}
            />
          </div>
        ))}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default EditUserOrgProfile;
