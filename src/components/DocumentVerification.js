import React, { useState, useRef} from 'react';
import api from '../utils/api';
import './DocumentVerification.css';

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
  const fileInputRef = useRef(null);

  const hashGenerator = new SimpleHashGenerator();
  const verifier = new SimpleVerifier();
  const processor = new DocumentProcessor(hashGenerator, verifier);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Document Verification</h1>

            <div
                className="flex items-center justify-center w-full mb-4"
            >
              <label
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  htmlFor="dropzone-file"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <svg
                      className="w-8 h-8 mb-3 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {file ? (
                      <div>
                        <p className="mb-2 text-sm text-gray-700 font-semibold">
                          Selected File: {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                  ) : (
                      <>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-500">Max file size: 5MB</p>
                      </>
                  )}
                </div>
                <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={isLoading}
                    data-testid="file-upload-input"
                />
              </label>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
              <button
                  className="btn btn-primary flex-grow"
                  onClick={handleSubmit}
                  disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Document'}
              </button>
              <button
                  className="btn btn-secondary flex-grow"
                  onClick={handleVerify}
                  disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Document'}
              </button>
            </div>

            {error && <div className="alert alert-danger text-center">{error}</div>}

            {submissionResult && (
                <div className="alert alert-success text-center">
                  Document submitted. Result: {submissionResult}
                </div>
            )}

            {verificationResult && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold mb-2">Verification Result:</h2>
                  <table className="w-full mb-4 border">
                    <tbody>
                    <tr>
                      <th className="border p-2 text-left">File Name</th>
                      <td className="border p-2">{verificationResult.name}</td>
                    </tr>
                    </tbody>
                  </table>
                  <h3 className="text-md font-semibold mb-2">Owner Information:</h3>
                  <table className="w-full border">
                    <tbody>
                    <tr>
                      <th className="border p-2 text-left">Name</th>
                      <td className="border p-2">{verificationResult.owner.name}</td>
                    </tr>
                    <tr>
                      <th className="border p-2 text-left">Email</th>
                      <td className="border p-2">{verificationResult.owner.email}</td>
                    </tr>
                    <tr>
                      <th className="border p-2 text-left">Position</th>
                      <td className="border p-2">{verificationResult.owner.position}</td>
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