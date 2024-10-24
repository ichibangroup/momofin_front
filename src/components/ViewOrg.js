import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ViewOrg.css';
import api from "../utils/api";

const ViewOrganisations = () => {
  const navigate = useNavigate();
  const [, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [organizations, setOrganizations] = useState([
  ]);

  // Replace this with a function to fetch organization data from your backend
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/momofin-admin/organizations');
      setOrganizations(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

    return (
        <div className="view-organisations">
            <h1>View All Organisations</h1>
            <div className="headers">
                <div>Name</div>
                <div>Industry</div>
                <div>Address</div>
                <div>Description</div>
                <div>Actions</div>
            </div>
            <div className="organisation-rows-container">
                {organizations.map((org) => (
                    <div key={org.id} className="organisation-row">
                        <div>{org.name}</div>
                        <div>{org.industry}</div>
                        <div>{org.location}</div>
                        <div>{org.description}</div>
                        <div className="actions">
                            <button data-testid="edit-btn" className="edit-btn">✏️</button>
                            <button data-testid="delete-btn" className="delete-btn">❌</button>
                        </div>
                    </div>
                ))}
            </div>
            <button className="add-btn" onClick={() => navigate('/app/momofinDashboard/addNewOrganisation')}>ADD ORGANISATION</button>
        </div>
    );
}

export default ViewOrganisations;
