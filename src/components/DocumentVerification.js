import React, { useState } from 'react';
import api from '../utils/api';

export class IHashGenerator {
  generateHash(file) {
    throw new Error("Method 'generateHash()' must be implemented.");
  }
}

export class IVerifier {
  verify(hash) {
    throw new Error("Method 'verify()' must be implemented.");
  }
}

export class SimpleHashGenerator extends IHashGenerator {
  generateHash(file) {
    return `simple_hash_${file.name}`;
  }
}

export class AdvancedHashGenerator extends IHashGenerator {
  generateHash(file) {
    return `advanced_hash_${file.name}`;
  }
}

export class SimpleVerifier extends IVerifier {
  verify(hash) {
    return hash.startsWith('simple_hash_') || hash.startsWith('advanced_hash_');
  }
}

export class DocumentProcessor {
  constructor(hashGenerator, verifier) {
    this.hashGenerator = hashGenerator;
    this.verifier = verifier;
  }

  async submitDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`http://localhost:8080/doc/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },});
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.errorMessage || 'Error submitting document');
    }
  }

  async verifyDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post(`http://localhost:8080/doc/verify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },});
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.errorMessage || 'Error verifying document');
    }
  }
}

const DocumentVerification = () => {
  const [file, setFile] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const hashGenerator = new SimpleHashGenerator();
  const verifier = new SimpleVerifier();
  const processor = new DocumentProcessor(hashGenerator, verifier);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const MAX_FILE_SIZE_IN_MB = 5
    const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024;
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must be less than ' +MAX_FILE_SIZE_IN_MB+'MB.');
      setFile(null);
      setSubmissionResult(null);
      setVerificationResult(null);
    } else {
      setFile(selectedFile);
      setError(null);
      setSubmissionResult(null);
      setVerificationResult(null);
    }
  };

  const handleSubmit = async () => {
    if (file) {
      try {
        const result = await processor.submitDocument(file);
        setSubmissionResult(result.documentSubmissionResult);
        setError(null);
      } catch (err) {
        setError(err.message);
        setSubmissionResult(null);
      }
    } else {
      console.log('Setting error: Please select a file to submit.');
      setError('Please select a file to submit.');
    }
  };

  const handleVerify = async () => {
    if (file) {
      try {
        const result = await processor.verifyDocument(file);
        setVerificationResult(result.document);
        setError(null);
      } catch (err) {
        setError(err.message);
        setVerificationResult(null);
      }
    } else {
      console.log('Setting error: Please select a file to verify.');
      setError('Please select a file to verify.');
    }
  };

  return (
      <div>
        <h1>Document Verification</h1>
        <div>
          <label htmlFor="file-input">Choose a file:</label>
          <input id="file-input" type="file" onChange={handleFileChange} />
        </div>
        <div>
          <button onClick={handleSubmit}>
            Submit Document
          </button>
        </div>
        <div>
          <button onClick={handleVerify}>
            Verify Document
          </button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {submissionResult && <p>Document submitted. Result: {submissionResult}</p>}
        {verificationResult && (
            <div>
              <h2>Verification Result:</h2>
              <p>Document ID: {verificationResult.documentId}</p>
              <p>File Name: {verificationResult.name}</p>
              <p>Hash: {verificationResult.hashString}</p>
              <h3>Owner Information:</h3>
              <p>Name: {verificationResult.owner.name}</p>
              <p>Email: {verificationResult.owner.email}</p>
              <p>Position: {verificationResult.owner.position}</p>
            </div>
        )}
      </div>
  );
};

export default DocumentVerification;