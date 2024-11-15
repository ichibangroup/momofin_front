import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import '../ViewDocuments.css';
import {Eye} from "lucide-react";

const DocumentVersionModal = ({ documentId, isOpen, onClose }) => {
    const [versions, setVersions] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const handleViewDocument = async (documentId, version) => {
        try {
            const response = await api.get(`/doc/view/${documentId}/${version}`);
            const url = response.data.url;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to get document URL:', error);
            const errorMsg = error.response?.data?.message || 'An unknown error occurred';
            setErrorMessage(`Failed to load document: ${errorMsg}`);
        }
    }

    const fetchVersions = useCallback(async () => {
        try {
            const response = await api.get(`/doc/${documentId}/versions`);
            setVersions(response.data);
        } catch (error) {
            console.error('Error fetching document versions:', error);
        }
    }, [documentId]);

    useEffect(() => {
        if (isOpen) {
            fetchVersions();
        }
    }, [isOpen, fetchVersions]);

    return (
        <div className={`modal-backdrop ${isOpen ? 'show' : ''}`}>
            <div className="modal">
                <div className="modal-header">
                    <h2>Document Versions</h2>
                    <button onClick={onClose} className="modal-close-button">
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {errorMessage && (
                        <div>
                            <h2>Error</h2>
                            <p>{errorMessage}</p>
                        </div>
                    )}
                    <table>
                        <thead>
                        <tr>
                            <th>Version</th>
                            <th>Edited By</th>
                            <th>Created Date</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {versions.map((version) => (
                            <tr key={version.id.version}>
                                <td>{version.id.version}</td>
                                <td>{version.editedBy.username}</td>
                                <td>{version.createdDate}</td>
                                <td>
                                    <button
                                        onClick={() => handleViewDocument(version.id.documentId, version.id.version)}
                                        className="px-3 py-2 flex items-center gap-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                                    >
                                        <Eye size={16}/>
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DocumentVersionModal;