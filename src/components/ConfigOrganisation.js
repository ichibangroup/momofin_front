import React, { useState, useEffect } from 'react';
import './ConfigOrganisation.css';

import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Your axios instance

const ConfigOrganisation = () => {
  const { id } = useParams()
  const navigate = useNavigate();

  const [organization, setOrganization] = useState({
    name: '',
    industry: '',
    location: '',
    description: '',
    mainAdmin: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [validationErrors, setValidationErrors] = useState({
    industry: '',
    location: '',
  });

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/organizations/${id}`);
        setOrganization(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch organization details');
        console.error('Error fetching organization:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
    } else {
      navigate('/login')
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation
    let errors = {};
    if (!organization.name) {
      errors.name = 'Name is required';
    }
    if (!organization.industry) {
      errors.industry = 'Industry is required';
    }
    if (!organization.location) {
      errors.location = 'Location is required';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await api.put(`/api/organizations/${id}`, organization);
      // Show success message or redirect
      navigate(-1); // Adjust this path as needed
    } catch (err) {
      setError('Failed to update organization');
      console.error('Error updating organization:', err);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate the fields as they are changed
    let errorMessage = '';
    if (name === 'industry') {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'Industry name must contain only letters and spaces.';
      }
    }

    if (name === 'location') {
      if (!/^[A-Za-z0-9\s,]+$/.test(value)) {
        errorMessage = 'Location can only contain letters, numbers, and commas.';
      }
    }

    setOrganization(prev => ({
      ...prev,
      [name]: value
    }));

    setValidationErrors(prevErrors => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
      <div className="config-organisation-header">
        <header className="header">
          <h1 className="title">Configure Organisation</h1>
        </header>

        <div className="config-organisation" data-testid="config-organisation">
          <main className="main-content">
            <div className="org-info">
              <div className="org-image"></div>
              <div className="org-details">
                <h2>{organization.name}</h2>
                <p>{organization.location}</p>
                <p>{organization.industry} Industry</p>

                <div className="button-group">
                  <button className="add-user-button">
                    <Link to={`/app/configOrganisation/${id}/addUserOrgAdmin`}>ADD USER</Link>
                  </button>

                  <button className="view-org-button">
                    <Link to={`/app/configOrganisation/${id}/viewOrganisationUsers`}>VIEW ORG USERS LIST</Link>
                  </button>
                </div>
              </div>
            </div>

            <section className="general-section">
              <h3>General</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">NAME</label>
                  <input
                      type="text"
                      id="name"
                      name="organisation-name"
                      value={organization.name}
                      onChange={handleChange}
                      disabled={true}
                      title = "Name cannot be edited after creation"
                  />
                  {validationErrors.name && (
                      <span className="error-message">{validationErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="industry">INDUSTRY</label>
                  <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={organization.industry}
                      onChange={handleChange}
                  />
                  {validationErrors.industry && (
                      <span className="error-message">{validationErrors.industry}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="location">ADDRESS</label>
                  <input
                      type="text"
                      id="location"
                      name="location"
                      value={organization.location}
                      onChange={handleChange}
                  />
                  {validationErrors.location && (
                      <span className="error-message">{validationErrors.location}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="description">DESCRIPTION</label>
                  <textarea
                      id="description"
                      name="description"
                      value={organization.description}
                      onChange={handleChange}
                  />
                </div>
              </form>
            </section>
          </main>

          <footer className="footer">
            <button className="cancel-button" onClick={() => navigate(-1)}>
              CANCEL
            </button>
            <button className="save-button" onClick={handleSubmit}>
              SAVE
            </button>
          </footer>
        </div>
      </div>
  );
};

export default ConfigOrganisation;