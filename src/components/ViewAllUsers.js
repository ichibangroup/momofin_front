import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../ViewAllUsers.css';
import api from "../utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faPencilAlt,
  faTrash,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons';
import DeleteUserModal from './DeleteUserModal';

function ViewUsers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/momofin-admin/users');
            setUsers(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Helper functions for RBAC - Updated to match backend boolean flags
    const isMomofinAdmin = (user) => {
        return user?.momofinAdmin === true;
    };

    const isOrgAdmin = (user) => {
        return user?.organizationAdmin === true;
    };

    const canEditUser = (targetUser) => {
        // Momofin admin cannot edit other momofin admins
        if (isMomofinAdmin(targetUser)) {
            return false;
        }
        return true;
    };

    const canDeleteUser = (targetUser) => {
        // Momofin admin cannot delete other momofin admins
        if (isMomofinAdmin(targetUser)) {
            return false;
        }
        return true;
    };

    const canPromoteUser = (targetUser) => {
        // Cannot promote if user is already a Momofin admin or Org admin
        if (isMomofinAdmin(targetUser) || isOrgAdmin(targetUser)) {
            return false;
        }
        return true;
    };

    // Sorting functions
    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
        return sortConfig.direction === 'asc' ?
            <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-500" /> :
            <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-500" />;
    };

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });

        const sortedUsers = [...users].sort((a, b) => {
            const valueA = a[key]?.toString().toLowerCase() || '';
            const valueB = b[key]?.toString().toLowerCase() || '';

            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setUsers(sortedUsers);
    };

    const handlePromoteToAdmin = async (orgId, userId) => {
        const originalUsers = [...users];
        
        try {
            setUsers(prevUsers => prevUsers.map(user => {
                if (user.userId === userId) {
                    return { ...user, organizationAdmin: true };
                }
                return user;
            }));

            await api.put(`/api/momofin-admin/organizations/name/${orgId}/users/${userId}/set-admin`);

            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }

            setStatusMessage({
                text: 'User has been successfully promoted to organization admin.',
                type: 'success'
            });

            // Refresh the list to ensure we have the latest data
            await fetchUsers();

            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000);

        } catch (error) {
            setUsers(originalUsers);
            const errorMessage = error.response?.data?.message || 'Failed to promote user to admin';
            
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }

            setStatusMessage({
                text: errorMessage,
                type: 'error'
            });

            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000);
