import React, { useState, useEffect } from 'react';
import '../ViewOrgUsers.css';
import api from "../utils/api";
import {Link, useNavigate, useParams} from "react-router-dom";

function UserManagement(orgId) {
    const { id } = useParams();
    const [loading, setLoading] = useState({});
    const [error, setError] = useState({});
    const navigate = useNavigate();
    const [users, setUsers] = useState([
    ]);

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
    }, [id]);
    
    return (
        <div className="user-management" data-testid="viewUsers-1">
            <h1>View Organisation Users</h1>
            <table>
            <tbody>
            <tr className="headers">
                <th><span>Icon</span></th>
                <th><span>Name</span></th>
                <th><span>Username</span></th>
                <th><span>Position</span></th>
                <th><span>Email</span></th>
                <th><span>Actions</span></th>
            </tr>
            <tr className="user-rows-container">
                {users.map((user, index) => (
                    <tr key={user.userId} className="user-row" role="row">
                        <td><i className="user-icon">👤</i></td>
                        <td>{user.name}</td>
                        <td>{user.username}</td>
                        <td>{user.position}</td>
                        <td>{user.email}</td>
                        <td className="actions">
                            <button className="edit-btn">✏️</button>
                            <button className="delete-btn">❌</button>
                        </td>
                    </tr>
                ))}
            </tr>
            </tbody>
            </table>
            <button className="add-btn"><Link to={`/app/configOrganisation/${id}/addUserOrgAdmin`}>ADD USER</Link></button>
        </div>
    );
}

export default UserManagement;
