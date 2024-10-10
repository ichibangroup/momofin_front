import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewOrganisation.css';


const ViewOrganisation = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([
    // Sample data for demonstration
    {
      id: 1,
      name: 'Organization 1',
      industry: 'Technology',
      address: '123 Main St, City, State, Country',
      description: 'This is a long description about Organization 1. It provides technology solutions.',
    },
    {
      id: 2,
      name: 'Organization 2',
      industry: 'Healthcare',
      address: '456 Oak St, City, State, Country',
      description: 'This is a shorter description for Organization 2.',
    },
    {
      id: 3,
      name: 'Organization 3',
      industry: 'Entertainment',
      address: 'Depok City',
      description: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  ]);

  // Replace this with a function to fetch organization data from your backend
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('https://your-api-endpoint/organizations'); // Replace with your API endpoint
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
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
              <td>{organization.address}</td>
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