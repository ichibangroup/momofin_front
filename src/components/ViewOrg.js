import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPencilAlt, 
  faTrash, 
  faSort, 
  faSortUp, 
  faSortDown,
  faBuilding 
} from '@fortawesome/free-solid-svg-icons';
import './ViewOrg.css';
import api from "../utils/api";
import StatusNotification from './StatusNotification';

const ViewOrganisations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/momofin-admin/organizations');
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      showStatusMessage('Failed to fetch organizations. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const showStatusMessage = (text, type) => {
    if (window.statusMessageTimeout) {
      clearTimeout(window.statusMessageTimeout);
    }
    setStatusMessage({ text, type });
    window.statusMessageTimeout = setTimeout(() => {
      setStatusMessage({ text: '', type: '' });
    }, 5000);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' ?
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-500" /> :
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-500" />;
  };

  const sortData = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sortedOrgs = [...organizations].sort((a, b) => {
      const valueA = a[key]?.toString().toLowerCase() || '';
      const valueB = b[key]?.toString().toLowerCase() || '';

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setOrganizations(sortedOrgs);
  };

  const handleEdit = (org) => {
    if (isEditing) {
      showStatusMessage('Another edit operation is in progress. Please wait.', 'warning');
      return;
    }

    setIsEditing(true);
    setEditingOrg({
      ...org,
      newIndustry: org.industry,
      newLocation: org.location,
      newDescription: org.description
    });
  };

  const handleUpdate = async () => {
    const orgToUpdate = editingOrg;
    const originalOrg = organizations.find(org => org.organizationId === orgToUpdate.organizationId);
    
    try {
      // Optimistically update the UI
      setOrganizations(prevOrgs => 
        prevOrgs.map(org => org.organizationId === orgToUpdate.organizationId ? {
          ...org,
          industry: orgToUpdate.newIndustry,
          location: orgToUpdate.newLocation,
          description: orgToUpdate.newDescription
        } : org)
      );

      // Reset editing state
      setIsEditing(false);
      setEditingOrg(null);

      // Make API call
      const response = await api.put(`/api/momofin-admin/organizations/${orgToUpdate.organizationId}`, {
        name: originalOrg.name, // Always send the original name
        industry: orgToUpdate.newIndustry,
        location: orgToUpdate.newLocation,
        description: orgToUpdate.newDescription
      });

      showStatusMessage('Organization updated successfully', 'success');

      // Update with the actual response data
      setOrganizations(prevOrgs =>
        prevOrgs.map(org => org.organizationId === orgToUpdate.organizationId ? response.data : org)
      );

    } catch (error) {
      console.error('Error updating organization:', error);
      
      // Revert changes in UI
      setOrganizations(prevOrgs =>
        prevOrgs.map(org => org.organizationId === orgToUpdate.organizationId ? originalOrg : org)
      );

      const errorMessage = error.response?.data?.message || 'Failed to update organization';
      showStatusMessage(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    const orgToDelete = selectedOrg;

    try {
      // Close the modal first
      setShowDeleteDialog(false);
      setSelectedOrg(null);

      // Optimistically remove from UI
      setOrganizations(prevOrgs => 
        prevOrgs.filter(org => org.organizationId !== orgToDelete.organizationId)
      );

      // Make API call
      await api.delete(`/api/momofin-admin/organizations/${orgToDelete.organizationId}`);
      
      await fetchOrganizations();

      showStatusMessage(`${orgToDelete.name} has been successfully deleted.`, 'success');

    } catch (error) {
      console.error('Error deleting organization:', error);
      
      // Revert deletion in UI
      setOrganizations(prevOrgs => [...prevOrgs, orgToDelete]);

      const errorMessage = error.response?.data?.message || 'Failed to delete organization';
      showStatusMessage(errorMessage, 'error');
      await fetchOrganizations();
    }
  };

  const getOrgIcon = () => {
    return (
      <div className="flex items-center gap-2">
        <span className="tooltip-container">
          <FontAwesomeIcon
            icon={faBuilding}
            className="text-blue-500"
            title="Organization"
          />
        </span>
      </div>
    );
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="user-management" data-testid="viewOrgs-1">
      <StatusNotification
        message={statusMessage.text}
        type={statusMessage.type}
      />
      <h1>View All Organisations</h1>
      <table>
        <thead>
          <tr className="headers">
            <th>Type</th>
            <th className="sort-header" onClick={() => sortData('name')}>
              Name {getSortIcon('name')}
            </th>
            <th className="sort-header" onClick={() => sortData('industry')}>
              Industry {getSortIcon('industry')}
            </th>
            <th className="sort-header" onClick={() => sortData('location')}>
              Address {getSortIcon('location')}
            </th>
            <th className="sort-header" onClick={() => sortData('description')}>
              Description {getSortIcon('description')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org.organizationId} className="user-row">
              <td>{getOrgIcon()}</td>
              <td>{org.name}</td>
              <td>{org.industry}</td>
              <td>{org.location}</td>
              <td>{org.description}</td>
              <td className="actions">
                <button 
                  className="edit-btn mr-2" 
                  title="Edit Organisation" 
                  onClick={() => handleEdit(org)}
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
                <button
                  className="delete-btn"
                  title="Delete Organisation"
                  onClick={() => {
                    setSelectedOrg(org);
                    setShowDeleteDialog(true);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Organization</h2>
            <p>Are you sure you want to delete {selectedOrg?.name}? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteDialog(false)}>Cancel</button>
              <button className="delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <Link
        to="/app/momofinDashboard/addNewOrganisation"
        className="custom-add-btn"
      >
        ADD ORGANISATION
      </Link>
    </div>
  );
};

export default ViewOrganisations;