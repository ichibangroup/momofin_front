import React, { useState, useEffect } from 'react';
import '../ViewAllUsers.css'; // Ensure the CSS file path is correct
import api from "../utils/api";
import {Link} from 'react-router-dom';

function ViewEditRequests() {
    const [, setLoading] = useState(true);
    const [, setError] = useState(null);
    const [requests, setRequests] = useState([

    ]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/doc/edit-request');
            setRequests(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setError('Failed to fetch requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <div className="view-users" data-testid="viewUsers-1">
            <h1>View All Users</h1>
            <div className="headers">
                <div>Organisation</div>
                <div>Owner's Name</div>
                <div>Owner's Position</div>
                <div>Owner's Email</div>
                <div>Document</div>
                <div>Actions</div>
            </div>
            <div className="user-rows-container">
                {requests.map((request) => (
                    <div key={request.documentId} className="user-row">
                        <div>{request.organizationName}</div>
                        <div>{request.username}</div>
                        <div>{request.position}</div>
                        <div>{request.email}</div>
                        <div>{request.documentName}</div>
                        <div className="actions">
                            <button className="edit-btn"><Link to={`/app/editDocument/${request.documentId}`} className="btn btn-primary btn-sm">✏️</Link></button>
                            <button className="btn btn-danger btn-sm">❌</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ViewEditRequests;
