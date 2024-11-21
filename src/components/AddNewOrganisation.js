import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../utils/api';
import './AddNewOrganisation.css';

const OrganisationForm = ({ formData, onChange, onSubmit, onCancel }) => (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="add-organisation-form-label">Organisation Name:</label>
        <input
            type="text"
            className="add-organisation-form-control"
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="industry" className="add-organisation-form-label">Industry:</label>
        <input
            type="text"
            className="add-organisation-form-control"
            id="industry"
            value={formData.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="address" className="add-organisation-form-label">Address:</label>
        <input
            type="text"
            className="add-organisation-form-control"
            id="address"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
            required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="add-organisation-form-label">Description:</label>
        <textarea
            className="add-organisation-form-control"
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            required
        />
      </div>
      <div className="add-organisation-buttons">
        <button type="button" className="add-organisation-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="add-organisation-btn continue-btn">
          Continue
        </button>
      </div>
    </form>
);

const AdminForm = ({ formData, onChange, onSubmit, onBack, isSubmitting, errorMessage }) => (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label htmlFor="username" className="add-organisation-form-label">Username:</label>
        <input
            type="text"
            className="add-organisation-form-control"
            id="username"
            value={formData.username}
            onChange={(e) => onChange('username', e.target.value)}
            required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="add-organisation-form-label">Password:</label>
        <input
            type="password"
            className="add-organisation-form-control"
            id="password"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            required
        />
      </div>
      {errorMessage && <div className="add-organisation-error-message">{errorMessage}</div>}
      <div className="add-organisation-buttons">
        <button type="button" className="add-organisation-back-btn" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="add-organisation-btn submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Add Organisation'}
        </button>
      </div>
    </form>
);

const AddOrganisation = () => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    address: '',
    description: '',
    username: '',
    password: ''
  });
  const [isOrgDetailsSubmitted, setIsOrgDetailsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleOrgDetailsSubmit = (event) => {
    event.preventDefault();
    setIsOrgDetailsSubmitted(true);
  };

  const handleAdminDetailsSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await api.post('/api/momofin-admin/organizations', {
        name: formData.name,
        industry: formData.industry,
        location: formData.address,
        description: formData.description,
        adminUsername: formData.username,
        adminPassword: formData.password,
      });

      console.log('Submitted organization and admin data:', response.data);
      if (response.status === 200) {
        setFormData({
          name: '',
          industry: '',
          address: '',
          description: '',
          username: '',
          password: '',
        });
        navigate('/app/viewOrg');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to add organisation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => setIsOrgDetailsSubmitted(false);

  const handleCancel = () => {
    setFormData({
      name: '',
      industry: '',
      address: '',
      description: '',
      username: '',
      password: '',
    });
    navigate('/app/viewOrg');
  };

  return (
      <div className="add-organisation-container mt-5">
        <h1 className="add-organisation-text-3xl font-bold">
          {isOrgDetailsSubmitted ? 'Input Admin Details' : 'Add Organisation'}
        </h1>
        <div className="add-organisation-card">
          <div className="add-organisation-card-body">
            {isOrgDetailsSubmitted ? (
                <AdminForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleAdminDetailsSubmit}
                    onBack={handleGoBack}
                    isSubmitting={isSubmitting}
                    errorMessage={apiError}
                />
            ) : (
                <OrganisationForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleOrgDetailsSubmit}
                    onCancel={handleCancel}
                />
            )}
          </div>
        </div>
      </div>
  );
};

export default AddOrganisation;
