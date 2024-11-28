import React from 'react';
import PropTypes from 'prop-types';
import '../StatusNotification.css';

const StatusNotification = ({ message, type }) => {
  if (!message) return null;
  
  return (
    <div className={`status-notification status-${type}`}>
      {message}
    </div>
  );
};

StatusNotification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']).isRequired,
};

export default StatusNotification;