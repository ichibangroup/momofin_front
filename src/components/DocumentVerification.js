import React from 'react';

const DocumentVerification = () => {
  return (
    <div className="document-verification">
      <h1 className="title">Document Verification</h1>
      <label htmlFor="fileInput">Choose a file:</label>
      <input id="fileInput" type="file" />
      <button>Generate Hash</button>
    </div>
  );
};

export default DocumentVerification;