import React from 'react';
import './ViewUsers.css';

const ViewUsers = () => {
    return (
        <div className="view-users" data-testid="viewUsers-1">
            <h1 className="title">View Users</h1>
            <p>This is a placeholder page for viewing users. User data will be displayed here in the future.</p>

            <div className="user-list" data-testid="user-list">
                <div className="user-item" data-testid="user-item">User 1</div>
                <div className="user-item" data-testid="user-item">User 2</div>
                <div className="user-item" data-testid="user-item">User 3</div>
            </div>
        </div>
    );
}

export default ViewUsers;