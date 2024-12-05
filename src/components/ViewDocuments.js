import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../index.css';
import '../ViewDocuments.css';
import { Eye, Link, Check, X } from 'lucide-react';
import DocumentVersionModal from './DocumentVersionModal';

function Page() {
  const [documents, setDocuments] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState(''); // New state for the username input
  const [currentDocumentId, setCurrentDocumentId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isDocumentVersionsModalOpen, setIsDocumentVersionsModalOpen] = useState(false);

  const openDocumentVersionsModal = (documentId) => {
    setCurrentDocumentId(documentId);
    setIsDocumentVersionsModalOpen(true);
  };

  const closeDocumentVersionsModal = () => {
    setIsDocumentVersionsModalOpen(false);
  };

  useEffect(() => {
    handleGetDocuments();
  }, []);

  const handleGetDocuments = async () => {
    try {
      const response = await api.get('/doc/view');
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
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
    const verificationUrl = `https://avento-trust.netlify.app/app/verify/${documentId}`;
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopiedId(documentId);
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

  const openEditRequestModal = (documentId) => {
    setCurrentDocumentId(documentId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowModal(false);
    setErrorMessage('');
    setUsername('');
  };

  const handleSubmitEditRequest = async () => {
    if (!username) {
      setErrorMessage("Please enter a username.");
      setShowModal(true);
      return;
    }

    try {
      const response = await api.post(`/doc/${currentDocumentId}/request-edit`, {
        username: username
      });
      closeModal();
      setErrorMessage("Edit request submitted successfully!");
      setShowModal(true);
      handleGetDocuments();
      return response.data;
    } catch (error) {
      closeModal();
      console.error("Error requesting edit:", error);
      setErrorMessage(error.response?.data?.errorMessage || "Failed to submit edit request. Please try again.");
      setShowModal(true);
    }
  };

  const handleCancelEditRequest = async (documentId) => {
    try {
      await api.delete(`/doc/edit-request/${documentId}/cancel`);
      setErrorMessage("Edit request cancelled successfully!");
      setShowModal(true);
      handleGetDocuments();
    } catch (error) {
      console.error("Error cancelling edit request:", error);
      setErrorMessage(error.response?.data?.errorMessage || "Failed to cancel edit request. Please try again.");
      setShowModal(true);
    }
  };

  return (
      <div className="page-container">
        <h1 className="view-document-title">Your Documents</h1>
        {showModal && (
            <div className="modal-backdrop">
              <div className="modal">
                <h2>Info</h2>
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
        <table className="alpha-table">
          <thead className="document-headers">
          <tr>
            <th className="text-center">File Names</th>
            <th className="text-center">Actions</th>
          </tr>
          </thead>
          <tbody>
          {documents && documents
              .filter(document => document.name.toLowerCase().includes(keyword.toLowerCase()))
              .map(document => (
                  <tr key={document.documentId}>
                    <td>{document.name}</td>
                    <td className="flex gap-2">
                      <button
                          onClick={() => handleViewDocument(document.documentId)}
                          disabled={loading}
                          className="px-3 py-2 flex items-center gap-2 text-sm rounded-md view-button"
                      >
                        <Eye size={16}/>
                        View
                      </button>
                      <button
                          onClick={() => handleCopyLink(document.documentId)}
                          className="px-3 py-2 flex items-center gap-2 text-sm rounded-md copy-link-button"
                      >
                        {copiedId === document.documentId ? (
                            <>
                              <Check size={16}/>
                              Copied!
                            </>
                        ) : (
                            <>
                              <Link size={16}/>
                              Copy Link
                            </>
                        )}
                      </button>
                      {document.beingRequested ? (
                          <button
                              onClick={() => handleCancelEditRequest(document.documentId)}
                              className="px-3 py-2 flex items-center gap-2 text-sm rounded-md  cancel-request-button"
                          >
                            <X size={16}/>
                            Cancel Edit Request
                          </button>
                      ) : (
                          <button
                              onClick={() => openEditRequestModal(document.documentId)}
                              className="px-3 py-2 flex items-center gap-2 text-sm rounded-md  edit-request-button"
                          >
                            Request Edit
                          </button>
                      )}
                      <button className="version-button" onClick={() => openDocumentVersionsModal(document.documentId)}>Version History</button>
                    </td>
                  </tr>
              ))}
          </tbody>
        </table>
        {isModalOpen && (
            <div className="modal-backdrop">
              <div className="modal">
                <h2>Enter Username</h2>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <div className="modal-buttons">
                  <button onClick={handleSubmitEditRequest}>Submit Request</button>
                  <button onClick={closeModal}>Cancel</button>
                </div>
              </div>
            </div>
        )}


        {isDocumentVersionsModalOpen && (
            <DocumentVersionModal
                documentId={currentDocumentId}
                isOpen={isDocumentVersionsModalOpen}
                onClose={closeDocumentVersionsModal}
            />
        )}
      </div>
  );
}

export default Page;
