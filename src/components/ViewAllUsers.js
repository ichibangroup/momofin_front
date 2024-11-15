import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../ViewAllUsers.css'; // Ensure the CSS file path is correct
import api from "../utils/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faPencilAlt,
  faTrash,
  faUserPlus,
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
    const [, setStatusMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/momofin-admin/users');
                setUsers(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Failed to fetch users. Please try again later.');
                setLoading(false);
            }finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const getSortIcon = (key) => {
        //duplication
        if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
        //duplication
        return sortConfig.direction === 'asc' ?
            <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-500" /> :
            <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-500" />;
    };

    const sortThisData = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
        const sortUsers = [...users].sort((a, b) => {
            // duplication
            const valuesA = a[key]?.toString().toLowerCase() || '';
            const valuesB = b[key]?.toString().toLowerCase() || '';

            // duplication
            if (valuesA < valuesB) return direction === 'asc' ? -1 : 1;
            if (valuesA > valuesB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        setUsers(sortUsers);
    };
    const handleDeleteClick = (user) => {
        console.log('Delete user:', user);
        setDeleteModal({ isOpen: true, user });
    };
    const handleDeleteClose = () => {
        setDeleteModal({ isOpen: false, user: null });
    };
    const handleEditClick = (userId) => {
        navigate(`/app/editProfile/${userId}`);
    };
    const handlePromoteToAdmin = async (orgId, userId) => {
        try {
            setLoading(true);
            await api.put(`/api/momofin-admin/organizations/name/${orgId}/users/${userId}/set-admin`);
            setStatusMessage({
                text: 'User has been successfully promoted to organization admin.',
                type: 'success'
            });
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }
            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000);
        } catch (error) {
            const err = error.response?.data?.message || 'Failed to promote user to admin';
            console.error('Error promoting user:', error);
            setStatusMessage({
                text: err, type: 'error'
            });
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }
            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000);
        } finally {
            setLoading(false);
        }
    };    
    const handleDeleteConfirm = async () => {
        const userDelete = deleteModal.user;
        console.log('Deleting user:', userDelete);
        try {
            setLoading(true);
            handleDeleteClose();
            setUsers(prevUsers => prevUsers.filter(user => user.userId !== userDelete.userId));
            await api.delete(`/api/momofin-admin/users/${userDelete.userId}`);
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }
            setStatusMessage({
                text: `${userDelete.username} has been successfully removed from the organization.`, type: 'success'
            });
            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000);  
        } catch (err) {
            setUsers(prevUsers => [...prevUsers, userDelete]);
            const error = err.response?.data?.message || 'Failed to delete user';
            if (window.statusMessageTimeout) {
                clearTimeout(window.statusMessageTimeout);
            }
            setStatusMessage({
                text: error, type: 'error'
            });
            window.statusMessageTimeout = setTimeout(() => {
                setStatusMessage({ text: '', type: '' });
            }, 5000); 
            console.error('Error deleting user:', err);
        } finally {
            setLoading(false);
        }
    };
    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center text-red-600 p-4">{error}</div>;
    return (
        <div className="user-management" data-testid="viewUsers-1">
    <h1>View All Users</h1>
    <table>
        <thead>
            <tr className="headers">
                <th className="sort-header" onClick={() => sortThisData('name')}>Name {getSortIcon('name')}</th>
                <th className="sort-header" onClick={() => sortThisData('username')}>Username {getSortIcon('username')}</th>
                <th className="sort-header" onClick={() => sortThisData('organization')}>Organisation {getSortIcon('organization')}</th>
                <th className="sort-header" onClick={() => sortThisData('email')}>Email {getSortIcon('email')}</th>
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
                                    <button
                                        className="promote-btn"
                                        title="Promote to Admin"
                                        onClick={() => handlePromoteToAdmin(user.organization, user.userId)}
                                    >
                                        <FontAwesomeIcon icon={faStar} />
                                    </button>
                                </>
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
    to="/app/configOrganisation/addUserOrgAdmin" 
    className="custom-add-btn"
>
    <FontAwesomeIcon icon={faUserPlus} />
    ADD USER
</Link>
</div>

    );
}

export default ViewUsers;
