import React, {useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../utils/api';
import '../ViewDocuments.css';

const EditDocumentPage = () => {
    const { documentId } = useParams();
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

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
                navigate('/app/viewEditRequests')
            } catch (error) {
                setError(error.response?.data?.errorMessage || error.message);
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
                    <div
                        className="flex items-center justify-center w-full mb-4"
                    >
                        <label
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            htmlFor="dropzone-file"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <svg
                                    className="w-8 h-8 mb-3 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                {file ? (
                                    <div>
                                        <p className="mb-2 text-sm text-gray-700 font-semibold">
                                            Selected File: {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Size: {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">Click to upload</span>
                                        </p>
                                        <p className="text-xs text-gray-500">Max file size: 5MB</p>
                                    </>
                                )}
                            </div>
                            <input
                                id="dropzone-file"
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                disabled={isLoading}
                                data-testid="file-upload-input"
                            />
                        </label>
                    </div>
                    <div className="d-flex gap-2 mb-3">
                        <button className="btn btn-primary view-button" onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Edit'}
                        </button>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default EditDocumentPage;