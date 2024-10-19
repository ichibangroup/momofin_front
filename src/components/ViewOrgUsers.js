import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../ViewOrgUsers.css';

function UserManagement(orgId) {
    const [users, setUsers] = useState([]); 

    useEffect(() => {
        handleGetUsers();
    }, []);

    const handleGetUsers = async () => {
        try {
        const response = await api.get('/doc/view');
        setUsers(response.data.documents);
        } catch (error) {
        console.error('Failed to fetch users:', error);
        }
    };

    return (
        <div className="user-management">
            <h1>View Ichiban Group Users</h1>
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
            <button className="add-btn">ADD USERS</button>
        </div>
    );
}

export default UserManagement;
