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
  const [isOrgDetailsSubmitted, setIsOrgDetailsSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleOrgDetailsSubmit = async (event) => {
    event.preventDefault();
    setIsOrgDetailsSubmitted(true);
  };

  const handleAdminDetailsSubmit = async (event) => {
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

    try {
      const response = await api.post('/api/momofin-admin/organizations', organisationData);
      console.log('Submitted organization and admin data: ', response.data);
      if (response.status === 200) {
        setName('');
        setIndustry('');
        setAddress('');
        setDescription('');
        setUsername('');
        setPassword('');

        navigate('/app/viewOrg');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to add organisation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    setIsOrgDetailsSubmitted(false);

    setUsername('');
    setPassword('');
  };

  const handleCancel = () => {
    // Reset form data and navigate away (or reset to initial state)
    setName('');
    setIndustry('');
    setAddress('');
    setDescription('');
    setUsername('');
    setPassword('');

    // Navigate to a different page (e.g., back to the main dashboard)
    navigate('/app/viewOrg'); // Or any other route
  };

  return (
      <div className="add-organisation-container mt-5">
        <h1 className="add-organisation-text-3xl font-bold">
          {isOrgDetailsSubmitted ? 'Input Admin Details' : 'Add Organisation'}
        </h1>
        <div className="add-organisation-card">
          <div className="add-organisation-card-body">
            {!isOrgDetailsSubmitted ? (
                <form onSubmit={handleOrgDetailsSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="add-organisation-form-label">Organisation Name:</label>
                    <input
                        type="text"
                        className="add-organisation-form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="industry" className="add-organisation-form-label">Industry:</label>
                    <input
                        type="text"
                        className="add-organisation-form-control"
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="address" className="add-organisation-form-label">Address:</label>
                    <input
                        type="text"
                        className="add-organisation-form-control"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="add-organisation-form-label">Description:</label>
                    <textarea
                        className="add-organisation-form-control"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                  </div>
                  <div className="add-organisation-buttons">
                    <button type="button" className="add-organisation-cancel-btn" onClick={handleCancel}>
                      Cancel
                    </button>
                    <button type="submit" className="add-organisation-btn continue-btn">
                      Continue
                    </button>
                  </div>
                </form>
            ) : (
                <form onSubmit={handleAdminDetailsSubmit}>
                  <div className="mb-3">
                  <label htmlFor="username" className="add-organisation-form-label">Username:</label>
                    <input
                        type="text"
                        className="add-organisation-form-control"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="add-organisation-form-label">Password:</label>
                    <input
                        type="password"
                        className="add-organisation-form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                  </div>
                  {apiError && <div className="add-organisation-error-message">{apiError}</div>}
                  {/* Button container */}
                  <div className="add-organisation-buttons">
                    <button type="button" className="add-organisation-back-btn" onClick={handleGoBack}>
                      Back
                    </button>
                    <button type="submit" className="add-organisation-btn submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Add Organisation'}
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>
      </div>
  );
};

export default AddOrganisation;
