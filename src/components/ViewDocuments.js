import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../ViewDocuments.css';
import { Eye, Link, Check } from 'lucide-react'; // Added Link, Check, and Copy icons

function Page() {
  const [documents, setDocuments] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(null); // Track which link was copied

  useEffect(() => {
    handleGetDocuments();
  }, []);

  const handleGetDocuments = async () => {
    try {
      const response = await api.get('/doc/view');
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      setLoading(true);
      const response = await api.get(`/doc/view/${documentId}`);
      const url = response.data.url;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get document URL:', error);
      const errorMsg = error.response?.data?.message || 'An unknown error occurred';
      setErrorMessage(`Failed to load document: ${errorMsg}`);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (documentId) => {
    const verificationUrl = `https://momofin-docuver-staging.netlify.app/app/verify/${documentId}`;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedId(documentId);
      // Reset the copied status after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setErrorMessage('Failed to copy link to clipboard');
      setShowModal(true);
    }
  };

  const handleSearch = (e) => {
    setKeyword(e.target.value);
  };

  const closeModal = () => {
    setShowModal(false);
    setErrorMessage('');
  };

  return (
      <div className="page-container">
        <h1 className="page-title">Your Documents</h1>
        {showModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h2>Error</h2>
                <p>{errorMessage}</p>
                <button onClick={closeModal} className="modal-close-button">
                  Close
                </button>
              </div>
            </div>
        )}
        <input
            type="text"
            className="search-input"
            placeholder="Search File Name"
            value={keyword}
            onChange={handleSearch}
        />
        <table className="users-table">
          <thead>
          <tr>
            <th>File Names</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {documents
              .filter(document => document.name.toLowerCase().includes(keyword.toLowerCase()))
              .map(document => (
                  <tr key={document.documentId}>
                    <td>{document.name}</td>
                    <td className="flex gap-2">
                      <button
                          onClick={() => handleViewDocument(document.documentId)}
                          disabled={loading}
                          className="px-3 py-2 flex items-center gap-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                          onClick={() => handleCopyLink(document.documentId)}
                          className="px-3 py-2 flex items-center gap-2 text-sm rounded-md bg-green-500 text-white hover:bg-green-600"
                      >
                        {copiedId === document.documentId ? (
                            <>
                              <Check size={16} />
                              Copied!
                            </>
                        ) : (
                            <>
                              <Link size={16} />
                              Copy Link
                            </>
                        )}
                      </button>
                    </td>
                  </tr>
              ))}
          </tbody>
        </table>
      </div>
  );
}

export default Page;