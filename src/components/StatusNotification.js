import React from 'react';
import '../StatusNotification.css';

const StatusNotification = ({ message, type }) => {
  if (!message) return null;
  
  return (
    <div className={`status-notification status-${type}`}>
      {message}
    </div>
  );
};

export default StatusNotification;