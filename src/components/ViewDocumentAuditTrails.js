import React, { useEffect, useState } from 'react';
import './ViewDocumentAuditTrails.css';
import api from "../utils/api";

const ViewAuditTrails = () => {
    const [, setLoading] = useState(true);
    const [, setError] = useState(null);
    const [audits, setAuditTrails] = useState([

    ]);

    // Replace this with a function to fetch user data from your backend
    const fetchAuditTrails = async () => {
        try {
            setLoading(true);
            const response = await api.get('/audit/audits');
            setAuditTrails(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching audits:', error);
            setError('Failed to fetch audits. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditTrails();
    }, []);

    return (
        <div className="view-users" data-testid="viewUsers-1">
            <h1 className="title">View Audits</h1>
                <table className="user-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Document</th>
                        <th>Action</th>
                        <th>Outcome</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {audits.map((audittrail) => (
                        <tr key={audittrail.id}>
                            <td>{audittrail.id}</td>
                            <td>{audittrail.username}</td>
                            <td>{audittrail.document}</td>
                            <td>{audittrail.action}</td>
                            <td>{audittrail.outcome}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
        </div>
    );
}

export default ViewAuditTrails;