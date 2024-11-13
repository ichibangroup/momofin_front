import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useParams } from "react-router-dom";

const SpecifiedDocumentVerifier = () => {
    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);

    const fetchDocument = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/doc/verify/${id}`);
            setDocument(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch document information: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setVerifying(true);
            setError(null);
            setVerificationResult(null);

            const response = await api.post(`/doc/verify/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setVerificationResult({
                success: true,
                message: response.data.message || 'Document verified successfully',
                data: response.data
            });
        } catch (err) {
            const errorMsg = err.response?.data?.errorMessage || 'Failed to verify document';
            setError(errorMsg);
            setVerificationResult({
                success: false,
                message: errorMsg
            });
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Document Verification</h2>
                    <p className="text-sm text-gray-600">
                        Verify document authenticity by uploading the file
                    </p>
                </div>

                {error && !verificationResult && (
                    <div className="border-l-4 border-red-400 bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-4 w-4 text-red-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {document && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Document Details:</p>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm">Name: {document.name}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg
                                    className="w-6 h-6 mb-2 text-gray-500"
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
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={verifying}
                            />
                        </label>
                    </div>

                    {verifying && (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            <span>Verifying document...</span>
                        </div>
                    )}

                    {verificationResult && (
                        <div className={`border-l-4 p-4 ${
                            verificationResult.success
                                ? 'bg-green-50 border-green-400'
                                : 'bg-red-50 border-red-400'
                        }`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {verificationResult.success ? (
                                        <svg
                                            className="h-4 w-4 text-green-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="h-4 w-4 text-red-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <h3 className={`text-sm font-medium ${
                                        verificationResult.success ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                        {verificationResult.success ? 'Success' : 'Verification Failed'}
                                    </h3>
                                    <p className={`text-sm mt-1 ${
                                        verificationResult.success ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                        {verificationResult.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpecifiedDocumentVerifier;