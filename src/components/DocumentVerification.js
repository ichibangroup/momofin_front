import React, { useState } from 'react';
import api from '../utils/api';
import './DocumentVerification.css';
import * as Sentry from '@sentry/react';


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
      const response = await api.post(`/doc/submit`, formData, {
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
      const response = await api.post(`/doc/verify`, formData, {
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
  const [isLoading, setIsLoading] = useState(false);

  const hashGenerator = new SimpleHashGenerator();
  const verifier = new SimpleVerifier();
  const processor = new DocumentProcessor(hashGenerator, verifier);

  logsubmitDocumentSuccess = (file) => {
    Sentry.captureMessage(`Document submitted: ${file.name}`);
  };

  logsubmitDocumentFailure = (file, error) => {
    Sentry.captureException(`Error submitting document ${file}: ${error.message}`);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const MAX_FILE_SIZE_IN_MB = 5;
    const MAX_FILE_SIZE = MAX_FILE_SIZE_IN_MB * 1024 * 1024;
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE_IN_MB}MB.`);
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
      setIsLoading(true);
      try {
        const result = await processor.submitDocument(file);
        setSubmissionResult(result.documentSubmissionResult);
        logsubmitDocumentSuccess(file);
        setError(null);
      } catch (err) {
        setError(err.message);
        setSubmissionResult(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please select a file to submit.');
    }
  };

  const handleVerify = async () => {
    if (file) {
      setIsLoading(true);
      try {
        const result = await processor.verifyDocument(file);
        setVerificationResult(result.document);
        setError(null);
      } catch (err) {
        setError(err.message);
        setVerificationResult(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please select a file to verify.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Document Verification</h1>
      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="file-input" className="form-label">Choose a file:</label>
            <input id="file-input" type="file" className="form-control" onChange={handleFileChange} />
          </div>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading }>
              {isLoading ? 'Submitting...' : 'Submit Document'}
            </button>
            <button className="btn btn-secondary" onClick={handleVerify} disabled={isLoading }>
              {isLoading ? 'Verifying...' : 'Verify Document'}
            </button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {submissionResult && <div className="alert alert-success">Document submitted. Result: {submissionResult}</div>}
          {verificationResult && (
            <div className="mt-4">
              <h2>Verification Result:</h2>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>File Name</th>
                    <td>{verificationResult.name}</td>
                  </tr>
                </tbody>
              </table>
              <h3>Owner Information:</h3>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Name</th>
                    <td>{verificationResult.owner.name}</td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>{verificationResult.owner.email}</td>
                  </tr>
                  <tr>
                    <th>Position</th>
                    <td>{verificationResult.owner.position}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;