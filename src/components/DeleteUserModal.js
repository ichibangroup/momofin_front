import React from 'react';
import '../DeleteUserModal.css';

const DeleteUserModal = ({ isOpen, onClose, onConfirm, userName }) => {
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true">
        <div className="modal-content" data-testid="modal-content">
          <div className="modal-header">
            <h2>Confirm User Deletion</h2>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete user "{userName}"? This action cannot be undone.</p>
          </div>
          <div className="modal-footer">
            <button 
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="delete-button"
              onClick={onConfirm}
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    );
  };

export default DeleteUserModal;