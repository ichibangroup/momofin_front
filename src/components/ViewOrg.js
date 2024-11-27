import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ViewOrg.css';
import api from "../utils/api";

const ViewOrganisations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="view-organisations">
      <h1>View All Organisations</h1>
      
      {statusMessage.text && (
        <div className={`alert alert-${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="headers">
        <div>Name</div>
        <div>Industry</div>
        <div>Address</div>
        <div>Description</div>
        <div>Actions</div>
      </div>

      <div className="organisation-rows-container">
        {organizations.map((org) => (
          <div key={org.organizationId} className="organisation-row">
            {isEditing && editingOrg?.organizationId === org.organizationId ? (
              <>
                <div className="read-only-field">{org.name}</div>
                <div><input className="edit-input" value={editingOrg.newIndustry} onChange={e => setEditingOrg({...editingOrg, newIndustry: e.target.value})} /></div>
                <div><input className="edit-input" value={editingOrg.newLocation} onChange={e => setEditingOrg({...editingOrg, newLocation: e.target.value})} /></div>
                <div><input className="edit-input" value={editingOrg.newDescription} onChange={e => setEditingOrg({...editingOrg, newDescription: e.target.value})} /></div>
                <div className="actions">
                  <button className="save-btn" onClick={handleUpdate}>💾</button>
                  <button className="cancel-btn" data-testid="cancel-edit-btn" onClick={() => {
                    setIsEditing(false);
                    setEditingOrg(null);
                  }}>❌</button>
                </div>
              </>
            ) : (
              <>
                <div>{org.name}</div>
                <div>{org.industry}</div>
                <div>{org.location}</div>
                <div>{org.description}</div>
                <div className="actions">
                  <button 
                    data-testid="edit-btn" 
                    className="edit-btn"
                    onClick={() => handleEdit(org)}
                  >
                    ✏️
                  </button>
                  <button 
                    data-testid="delete-btn" 
                    className="delete-btn"
                    onClick={() => {
                      setSelectedOrg(org);
                      setShowDeleteDialog(true);
                    }}
                  >
                    ❌
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <button 
        className="add-btn" 
        onClick={() => navigate('/app/momofinDashboard/addNewOrganisation')}
      >
        ADD ORGANISATION
      </button>

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
    </div>
  );
};

export default ViewOrganisations;