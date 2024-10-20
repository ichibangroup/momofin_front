import React, { useState, useEffect } from 'react';
import '../ViewAllUsers.css'; // Ensure the CSS file path is correct

function ViewUsers() {
    const [users] = useState([
        { name: 'Galih Ibrahim Kurniawan', username: 'Sirered', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
        { name: 'Clayton Ismail Nagle', username: 'Clay.ton', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
        { name: 'Muhammad Sakhran Thayyib', username: 'PeakFiction', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
        { name: 'Galih Ibrahim Kurniawan', username: 'Sirered', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
        { name: 'Clayton Ismail Nagle', username: 'Clay.ton', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
        { name: 'Muhammad Sakhran Thayyib', username: 'PeakFiction', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
        { name: 'Galih Ibrahim Kurniawan', username: 'Sirered', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
        { name: 'Clayton Ismail Nagle', username: 'Clay.ton', organisation: 'ICHIBAN GROUP', email: 'email.yeah@gmail.com' },
    ]);

    useEffect(() => {
        // to do fetch the data from an API
    }, []);

    return (
        <div className="view-users">
            <h1>View All Users</h1>
            <div className="headers">
                <div>Icon</div>
                <div>Name</div>
                <div>Username</div>
                <div>Organisation</div>
                <div>Email</div>
                <div>Actions</div>
            </div>
            <div className="user-rows-container">
                {users.map((user, index) => (
                    <div key={index} className="user-row">
                        <div>👤</div>
                        <div>{user.name}</div>
                        <div>{user.username}</div>
                        <div>{user.organisation}</div>
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
