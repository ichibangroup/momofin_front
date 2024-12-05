import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faStar,
  faUniversity,
  faPencilAlt,
  faTrash,
  faUserPlus,
  faSort,
  faSortUp,
  faSortDown
} from '@fortawesome/free-solid-svg-icons';
import DeleteUserModal from './DeleteUserModal';
import './ViewOrgUsers.css';
import api from '../utils/api';
import StatusNotification from './StatusNotification';

const UserManagement = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const navigate = useNavigate();
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchOrganizationUsers = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/organizations/${id}/users`);
                setUsers(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch organisation users');
                console.error('Error fetching organisation users:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrganizationUsers();
        } else {
            navigate('/login');
        }
    }, [id, navigate]);

    const getUserIcon = (user) => {
        const isMomofinAdmin = user.momofinAdmin || user.roles?.includes('ROLE_MOMOFIN_ADMIN');
        const isOrgAdmin = user.organizationAdmin || user.roles?.includes('ROLE_ORG_ADMIN');

        return (
            <div className="flex items-center gap-2">
                {isMomofinAdmin && (
                    <span className="tooltip-container">
            <FontAwesomeIcon
                icon={faStar}
                className="text-yellow-500"
                title="Momofin Admin"
            />
          </span>
                )}
                {isOrgAdmin && (
                    <span className="tooltip-container">
            <FontAwesomeIcon
                icon={faUniversity}
                className="text-blue-500"
                title="Organisation Admin"
            />
          </span>
                )}
                {!isMomofinAdmin && !isOrgAdmin && (
                    <span className="tooltip-container">
            <FontAwesomeIcon
                icon={faUser}
                className="text-gray-600"
                title="User"
            />
          </span>
                )}
            </div>
        );
    };


    const isAdmin = (user) => {
        return user.momofinAdmin || user.organizationAdmin ||
            user.roles?.includes('ROLE_MOMOFIN_ADMIN') ||
            user.roles?.includes('ROLE_ORG_ADMIN');
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

        const sortedUsers = [...users].sort((a, b) => {
            const valueA = a[key]?.toString().toLowerCase() || '';
            const valueB = b[key]?.toString().toLowerCase() || '';

            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setUsers(sortedUsers);
    };

    const handleDeleteClick = (user) => {
        setDeleteModal({ isOpen: true, user });
    };

    const handleDeleteClose = () => {
        setDeleteModal({ isOpen: false, user: null });
    };

    const handleEditClick = (userId) => {
        navigate(`/app/editUserOrgProfile/${userId}`);
    };

    const handleDeleteConfirm = async () => {
        const userToDelete = deleteModal.user;

        try {
            setLoading(true);
            // First close the modal
            handleDeleteClose();

            // Immediately update the UI
            setUsers(prevUsers => prevUsers.filter(user => user.userId !== userToDelete.userId));

            // Make the API call
            await api.delete(`/api/organizations/${id}/users/${userToDelete.userId}`);

            // Clear any existing timeout to prevent multiple messages
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }

            // Show success message
            setStatusMessage({
                text: `${userToDelete.username} has been successfully removed from the organization.`,
                type: 'success'
            });

            // Clear the message after 5 seconds and store the timeout ID
            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000);  // Changed to 5000ms (5 seconds)

        } catch (err) {
            // Revert the deletion in UI
            setUsers(prevUsers => [...prevUsers, userToDelete]);

            const errorMessage = err.response?.data?.message || 'Failed to delete user';

            // Clear any existing timeout for error messages too
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }

            setStatusMessage({
                text: errorMessage,
                type: 'error'
            });

            // Clear error message after 5 seconds
            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000);  // Changed to 5000ms (5 seconds)

            console.error('Error deleting user:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center text-red-600 p-4">{error}</div>;

    return (
        <div className="user-management" data-testid="viewUsers-1">
            <StatusNotification
                message={statusMessage.text}
                type={statusMessage.type}
            />
            <h1>View Organisation Users</h1>
            <table className="org-user-table">
                <thead>
                <tr className="org-user-headers">
                    <th>User Type</th>
                    <th className="sort-header" onClick={() => sortData('name')}>
                        Name {getSortIcon('name')}
                    </th>
                    <th className="sort-header" onClick={() => sortData('username')}>
                        Username {getSortIcon('username')}
                    </th>
                    <th className="sort-header" onClick={() => sortData('position')}>
                        Position {getSortIcon('position')}
                    </th>
                    <th className="sort-header" onClick={() => sortData('email')}>
                        Email {getSortIcon('email')}
                    </th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.userId} className="org-user-row">
                        <td>{getUserIcon(user)}</td>
                        <td>{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.position}</td>
                        <td>{user.email}</td>
                        <td className="actions">
                            {!isAdmin(user) && (
                                <>
                                    <button className="edit-btn mr-2" title="Edit User" onClick={() => handleEditClick(user.userId)}>
                                        <FontAwesomeIcon icon={faPencilAlt} />
                                    </button>
                                    <button
                                        className="delete-btn"
                                        title="Remove User"
                                        onClick={() => handleDeleteClick(user)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <DeleteUserModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteClose}
                onConfirm={handleDeleteConfirm}
                userName={deleteModal.user?.name || ''}
            />

            <Link
                to={`/app/configOrganisation/${id}/addUserOrgAdmin`}
                className="custom-add-btn"
            >
                <FontAwesomeIcon icon={faUserPlus} />
                ADD USER
            </Link>
        </div>
    );
};


export default UserManagement;