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

// Helper functions outside component
const performDelete = async (userId) => {
    await api.delete(`/api/momofin-admin/users/${userId}`);
};

const performPromote = async (orgId, userId) => {
    await api.put(`/api/momofin-admin/organizations/name/${orgId}/users/${userId}/set-admin`);
};

const updateUsersAfterDelete = (users, userIdToDelete) => 
    users.filter(user => user.userId !== userIdToDelete);

const updateUsersAfterPromote = (users, userId) => 
    users.map(user => user.userId === userId ? 
        { ...user, organizationAdmin: true } : user
    );

function ViewUsers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const showStatusMessage = (text, type, duration = 5000) => {
        if (window.statusMessageTimeout) {
            clearTimeout(window.statusMessageTimeout);
        }
        setStatusMessage({ text, type });
        window.statusMessageTimeout = setTimeout(() => {
            setStatusMessage({ text: '', type: '' });
        }, duration);
    };

    const handleApiOperation = async (operation, successMessage, errorPrefix) => {
        try {
            await operation();
            showStatusMessage(successMessage, 'success');
            await fetchUsers();
        } catch (error) {
            const errorMessage = error.response?.data?.message || `${errorPrefix}`;
            showStatusMessage(errorMessage, 'error');
        }
    };

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
        return () => {
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }
        };
    }, []);

    const isMomofinAdmin = (user) => {
        return user?.momofinAdmin === true;
    };

    const isOrgAdmin = (user) => {
        return user?.organizationAdmin === true;
    };

    const canEditUser = (user) => !isMomofinAdmin(user);
    const canDeleteUser = (user) => !isMomofinAdmin(user);
    const canPromoteUser = (user) => !isMomofinAdmin(user) && !isOrgAdmin(user);

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
            const comparison = valueA.localeCompare(valueB);
            return direction === 'asc' ? comparison : -comparison;
        });

        setUsers(sortedUsers);
    };

    const handlePromoteToAdmin = async (orgId, userId) => {
        await handleApiOperation(
            async () => {
                setUsers(prevUsers => updateUsersAfterPromote(prevUsers, userId));
                await performPromote(orgId, userId);
            },
            'User has been successfully promoted to organization admin.',
            'Failed to promote user to admin'
        );
    };

    const handleDeleteClick = (user) => {
        setDeleteModal({ isOpen: true, user });
    };

    const handleDeleteClose = () => {
        setDeleteModal({ isOpen: false, user: null });
    };

    const handleEditClick = (userId) => {
        navigate(`/app/editProfile/${userId}`);
    };

    const handleDeleteConfirm = async () => {
        const userToDelete = deleteModal.user;
        handleDeleteClose();

        await handleApiOperation(
            async () => {
                setUsers(prevUsers => updateUsersAfterDelete(prevUsers, userToDelete.userId));
                await performDelete(userToDelete.userId);
            },
            `${userToDelete.username} has been successfully removed.`,
            'Failed to delete user'
        );
    };

    const renderActionButtons = (user) => (
        <>
            {canEditUser(user) && (
                <button 
                    className="edit-btn mr-2" 
                    title="Edit User" 
                    onClick={() => handleEditClick(user.userId)}
                >
                    <FontAwesomeIcon icon={faPencilAlt} />
                </button>
            )}
            {canDeleteUser(user) && (
                <button
                    className="delete-btn mr-2"
                    title="Remove User"
                    onClick={() => handleDeleteClick(user)}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}
            {canPromoteUser(user) && (
                <button
                    className="promote-btn"
                    title="Promote to Admin"
                    onClick={() => handlePromoteToAdmin(user.organization, user.userId)}
                >
                    <FontAwesomeIcon icon={faStar} />
                </button>
            )}
        </>
    );

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center text-red-600 p-4">{error}</div>;

    return (
        <div className="user-management" data-testid="viewUsers-1">
            {statusMessage.text && (
                <div className={`status-message ${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}
            <h1>View All Users</h1>
            <div className="user-table-container">
                <table>
                    <thead>
                        <tr className="headers">
                            <th className="sort-header" onClick={() => handleSort('name')}>
                                Name {getSortIcon('name')}
                            </th>
                            <th className="sort-header" onClick={() => handleSort('username')}>
                                Username {getSortIcon('username')}
                            </th>
                            <th className="sort-header" onClick={() => handleSort('organization')}>
                                Organization {getSortIcon('organization')}
                            </th>
                            <th className="sort-header" onClick={() => handleSort('email')}>
                                Email {getSortIcon('email')}
                            </th>
                            <th className="sort-header">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.userId} className="user-row">
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td>{user.organization}</td>
                                <td>{user.email}</td>
                                <td className="actions">
                                    {renderActionButtons(user)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DeleteUserModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteClose}
                onConfirm={handleDeleteConfirm}
                userName={deleteModal.user?.name || ''}
            />
        </div>
    );
}

export default ViewUsers;