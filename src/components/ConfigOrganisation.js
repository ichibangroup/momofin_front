import React, { useState, useEffect } from 'react';
import './ConfigOrganisation.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api'; // Your axios instance

const ConfigOrganisation = () => {
  const { id } = useParams(); // Get the id from URL
  const navigate = useNavigate();

  const [organization, setOrganization] = useState({
    name: '',
    industry: '',
    address: '',
    description: '',
    mainAdmin: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    setOrganization(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
      <div className="config-organisation" data-testid="config-organisation">
        <header className="header">
          <button className="menu-button">☰</button>
          <h1 className="title">Configure Organisation</h1>
          <div className="logo">🔹</div>
        </header>

        <main className="main-content">
          <div className="org-info">
            <div className="org-image"></div>
            <div className="org-details">
              <h2>{organization.name}</h2>
              <p>MAIN ADMIN: {organization.mainAdmin}</p>
              <p>{organization.address}</p>
              <p>{organization.industry} Industry</p>

              <button className="add-user-button">
                <Link to={`/app/configOrganisation/${id}/addUserOrgAdmin`}>ADD USER</Link>
              </button>

              <button className="add-user-button">
                <Link to={`/app/configOrganisation/${id}/viewOrganisationUsers`}>VIEW ORG USERS LIST</Link>
              </button>
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
                    name="name"
                    value={organization.name}
                    onChange={handleChange}
                />
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
              </div>
              <div className="form-group">
                <label htmlFor="address">ADDRESS</label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={organization.address}
                    onChange={handleChange}
                />
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
  );
};

export default ConfigOrganisation;