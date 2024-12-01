import React, { useState, useEffect } from 'react';
import '../ViewDocuments.css'; // Ensure the CSS file path is correct
import api from "../utils/api";
import {Link} from 'react-router-dom';
import {Eye} from "lucide-react";

function ViewEditRequests() {
    const [loading, setLoading] = useState(true);
    const [, setError] = useState(null);
    const [requests, setRequests] = useState([

    ]);

    const handleViewDocument = async (documentId, organizationName) => {
        try {
            setLoading(true);
            // Using the new endpoint path and including organizationName as a query parameter
            const response = await api.get(`/doc/edit-request/${documentId}`, {
                params: {
                    organizationName: organizationName
                }
            });

            // Assuming the response structure matches DocumentViewUrlResponse
            const url = response.data.url;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to get document URL:', error);
            const errorMsg = error.response?.data?.message || 'An unknown error occurred';
            setError(`Failed to load document: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (documentId) => {
        try {
            setLoading(true);
            await api.delete(`/doc/edit-request/${documentId}`);

            // Remove the rejected request from the local state
            setRequests(prevRequests =>
                prevRequests.filter(request => request.documentId !== documentId)
            );

            setError(null);
        } catch (error) {
            console.error('Error rejecting request:', error);
            const errorMsg = error.response?.data?.message || 'An unknown error occurred';
            setError(`Failed to reject request: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

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
            <h1 className="view-document-title">View Edit Requests</h1>
            <table>
                <thead className="headers">
                <tr>
                    <th>Organisation</th>
                    <th>Owner's Name</th>
                    <th>Owner's Position</th>
                    <th>Owner's Email</th>
                    <th>Document</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                        {requests.map((request) => (
                            <tr key={request.documentId} className="user-row">
                                <td>{request.organizationName}</td>
                                <td>{request.username}</td>
                                <td>{request.position}</td>
                                <td>{request.email}</td>
                                <td>{request.documentName}</td>
                                <td className="actions">
                                    <button
                                        onClick={() => handleViewDocument(request.documentId, request.organizationName)}
                                        disabled={loading}
                                        className="px-3 py-2 flex items-center gap-2 text-sm rounded-md bg-blue-500 view-button"
                                    >
                                        <Eye size={16}/>
                                        View
                                    </button>
                                    <Link  to={`/app/editDocument/${request.documentId}`}
                                                                       className="px-3 py-2 mt-1 mb-1 flex items-center gap-2 text-sm rounded-md version-button">✏️ Accept</Link>
                                    <button
                                        onClick={() => handleRejectRequest(request.documentId)}
                                        disabled={loading}
                                        className="px-3 py-2 flex items-center gap-2 text-sm rounded-md edit-request-button"
                                    >❌ Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

export default ViewEditRequests;
