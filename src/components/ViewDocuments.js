import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../ViewDocuments.css';
import { Eye } from 'lucide-react'; // Import the eye icon for the view button

function Page() {
  const [documents, setDocuments] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal state
  const [errorMessage, setErrorMessage] = useState(''); // Error message state

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

      // Open the document URL in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get document URL:', error);
      alert('Failed to load document. Please try again.');

      // Get the error message from the backend response (if available)
      const errorMsg = error.response?.data?.message || 'An unknown error occurred';

      // Set error message and show modal
      setErrorMessage(`Failed to load document: ${errorMsg}`);
      setShowModal(true);
    } finally {
      setLoading(false);
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
                    <td>
                      <button
                          onClick={() => handleViewDocument(document.documentId)}
                          disabled={loading}
                          className="px-3 py-2 flex items-center gap-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
              ))}
          </tbody>
        </table>
        {/* Modal */}
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
      </div>
  );
}

export default Page;