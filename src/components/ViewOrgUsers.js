import React, { useState, useEffect } from 'react';
import '../ViewOrgUsers.css';
import api from "../utils/api";
import {Link, useNavigate, useParams} from "react-router-dom";

function UserManagement(orgId) {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            <div className="headers">
                <div><span>Icon</span></div>
                <div><span>Name</span></div>
                <div><span>Username</span></div>
                <div><span>Position</span></div>
                <div><span>Email</span></div>
                <div><span>Actions</span></div>
            </div>
            <div className="user-rows-container">
                {users.map((user, index) => (
                    <div key={index} className="user-row" role="row">
                        <div><i className="user-icon">👤</i></div>
                        <div>{user.name}</div>
                        <div>{user.username}</div>
                        <div>{user.position}</div>
                        <div>{user.email}</div>
                        <div className="actions">
                            <button className="edit-btn">✏️</button>
                            <button className="delete-btn">❌</button>
                        </div>
                    </div>
                ))}
            </div>
            <button className="add-btn"><Link to={`/app/configOrganisation/${id}/addUserOrgAdmin`}>ADD USER</Link></button>
        </div>
    );
}

export default UserManagement;
