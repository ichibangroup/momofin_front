import React, { useState } from 'react';

const DocumentVerification = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const generateHash = () => {
    // To be implemented
  };

  return (
    <div className="document-verification">
      <h1 className="title">Document Verification</h1>
      <div className="file-input-container">
        <label htmlFor="fileInput">Choose a file:</label>
        <input id="fileInput" type="file" onChange={handleFileChange} />
      </div>
      <button onClick={generateHash}>Generate Hash</button>
    </div>
  );
};

export default DocumentVerification;