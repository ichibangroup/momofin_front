import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../utils/api';
import './AddNewOrganisation.css';

const AddOrganisation = () => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    const organisationData = {
      name,
      industry,
      location: address,
      description,
      adminUsername: username,
      adminPassword: password,
    };

    // Implement logic to submit organization and admin user data
    try {
      const response = await api.post('/api/momofin-admin/organizations', organisationData);
      console.log('Submitted organization and admin data: ', response.data);
      if (response.status === 200) {
        // Clear form after submit
        setName('');
        setIndustry('');
        setAddress('');
        setDescription('');
        setUsername('');
        setPassword('');

        navigate('/app/viewOrg');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to add organisation. Plesae try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-3xl font-bold">Add Organisation</h1>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Organisation Name:</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="industry" className="form-label">Industry:</label>
              <input
                type="text"
                className="form-control"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address:</label>
              <input
                type="text"
                className="form-control"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description:</label>
              <textarea
                className="form-control"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <h2 className="mt-4">Admin User Details</h2>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username:</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password:</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {apiError && <div className="error-message">{apiError}</div>}
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Organisation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOrganisation;