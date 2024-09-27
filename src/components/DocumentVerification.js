import React, { useState } from 'react';

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

  processDocument(file) {
    const hash = this.hashGenerator.generateHash(file);
    const isVerified = this.verifier.verify(hash);
    return { hash, isVerified };
  }
}

const DocumentVerification = ({ 
  hashGenerator = new SimpleHashGenerator(),
  verifier = new SimpleVerifier()
}) => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const processor = new DocumentProcessor(hashGenerator, verifier);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleVerify = () => {
    if (file) {
      const processResult = processor.processDocument(file);
      setResult(processResult);
    }
  };

  return (
    <div>
      <h1>Document Verification</h1>
      <label htmlFor="file-input">Choose a file:</label>
      <input id="file-input" type="file" onChange={handleFileChange} />
      <button onClick={handleVerify} disabled={!file}>
        Verify Document
      </button>
      {result && (
        <div>
          <p>Hash: {result.hash}</p>
          <p>Verified: {result.isVerified ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;