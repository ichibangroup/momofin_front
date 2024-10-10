import React, { useState, useEffect } from 'react';
import '../ViewOrgUsers.css';

function UserManagement() {
    const [users, setUsers] = useState([
        { name: 'Galih Ibrahim Kurniawan', username: 'Sirered', position: 'CEO', email: 'email.yeah@gmail.com' },
        { name: 'Clayton Ismail Nagle', username: 'Clay.ton', position: 'CTO', email: 'email.yeah@gmail.com' },
        { name: 'Muhammad Sakhran Thayyib', username: 'PeakFiction', position: 'Head of Diagnostics', email: 'email.yeah@gmail.com' },
        { name: 'Gregorius Samuel Hutahaean', username: 'FreddyFazbear', position: 'Mere Peasant', email: 'email.yeah@gmail.com' },
        { name: 'Galih Ibrahim Kurniawan', username: 'Sirered', position: 'CEO', email: 'email.yeah@gmail.com' },
        { name: 'Clayton Ismail Nagle', username: 'Clay.ton', position: 'CTO', email: 'email.yeah@gmail.com' },
        { name: 'Muhammad Sakhran Thayyib', username: 'PeakFiction', position: 'Head of Diagnostics', email: 'email.yeah@gmail.com' },
        { name: 'Gregorius Samuel Hutahaean', username: 'FreddyFazbear', position: 'Mere Peasant', email: 'email.yeah@gmail.com' },
    ]);

    useEffect(() => {
        // to do, fetch user data from an API
    }, []);

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
