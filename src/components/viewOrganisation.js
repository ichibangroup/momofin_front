import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewOrganisation.css';
import api from "../utils/api";


const ViewOrganisation = () => {
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
    <div className="view-organisation" data-testid="viewOrg-1">
      <h1 className="title">View Organizations</h1>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>Back</button>

      {/* Organization Table */}
      <table className="organization-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Industry</th>
            <th>Address</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((organization) => (
            <tr key={organization.id}>
              <td>{organization.name}</td>
              <td>{organization.industry}</td>
              <td>{organization.location}</td>
              <td>
                <div className="description-cell">
                  {organization.description.length > 100 ? (
                    <div>{organization.description.slice(0, 100)}...</div>
                  ) : (
                    <div>{organization.description}</div>
                  )}
                </div>
              </td>
              <td>
                <button className="edit-button">EDIT</button>
                <button className="delete-button">DELETE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

            {/* Add Org Button */}
            <button onClick={() => navigate('/app/momofinDashboard/addNewOrganisation')}>
                Add Organisation
            </button>

      {/* No Organizations Message */}
      {organizations.length === 0 && (
        <p className="no-organizations">No organizations to display yet. Please add an organization.</p>
      )}
    </div>
  );
};

export default ViewOrganisation;