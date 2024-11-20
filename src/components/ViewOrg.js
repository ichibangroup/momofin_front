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
      

export default ViewOrganisations;