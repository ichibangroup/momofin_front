import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const EditDocumentPage = () => {
    const { documentId } = useParams();
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        const MAX_FILE_SIZE_IN_MB = 5;
        const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024;
        if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
            setError(`File size must be less than ${MAX_FILE_SIZE_IN_MB}MB.`);
            setFile(null);
        } else {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (file) {
            setIsLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);
                await api.post(`/doc/edit-request/${documentId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                // Redirect or display success message
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError('Please select a file to submit.');
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Edit Document</h1>
            <div className="card">
                <div className="card-body">
                    <div className="mb-3">
                        <label htmlFor="file-input" className="form-label">Choose a file:</label>
                        <input id="file-input" type="file" className="form-control" onChange={handleFileChange} />
                    </div>
                    <div className="d-flex gap-2 mb-3">
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Edit Request'}
                        </button>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default EditDocumentPage;