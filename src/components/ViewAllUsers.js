import React, { useState, useEffect } from 'react';
import '../ViewAllUsers.css'; // Ensure the CSS file path is correct
import api from "../utils/api";

function ViewUsers() {
    const [, setLoading] = useState(true);
    const [, setError] = useState(null);
    const [users, setUsers] = useState([

    ]);

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

    return (
        <div className="view-users">
            <h1>View All Users</h1>
            <div className="headers">
                <div>Name</div>
                <div>Username</div>
                <div>Organisation</div>
                <div>Email</div>
                <div>Actions</div>
            </div>
            <div className="user-rows-container">
                {users.map((user) => (
                    <div key={user.id} className="user-row">
                        <div>{user.name}</div>
                        <div>{user.username}</div>
                        <div>{user.organization}</div>
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

export default ViewUsers;
