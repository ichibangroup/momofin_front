import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import '../ViewDocuments.css';

const DocumentVersionModal = ({ documentId, isOpen, onClose }) => {
    const [versions, setVersions] = useState([]);

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
                    <table>
                        <thead>
                        <tr>
                            <th>Version</th>
                            <th>Edited By</th>
                            <th>Created Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {versions.map((version) => (
                            <tr key={version.id.version}>
                                <td>{version.id.version}</td>
                                <td>{version.editedBy.username}</td>
                                <td>{version.createdDate}</td>
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