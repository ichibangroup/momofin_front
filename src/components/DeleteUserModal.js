import React from 'react';
import PropTypes from 'prop-types';
import '../DeleteUserModal.css';

const DeleteUserModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-wrapper">
      <dialog 
        open={isOpen}
        className="modal-overlay"
        aria-modal="true"
      >
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
              type="button"
            >
              Cancel
            </button>
            <button 
              className="delete-button"
              onClick={onConfirm}
              type="button"
            >
              Delete User
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

DeleteUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  userName: PropTypes.string.isRequired,
};

export default DeleteUserModal;