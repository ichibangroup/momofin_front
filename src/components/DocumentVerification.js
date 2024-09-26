import React, { useState } from 'react';

// Interface Segregation Principle
class IHashGenerator {
  generateHash(file) {
    throw new Error("Method 'generateHash()' must be implemented.");
  }
}

class IVerifier {
  verify(hash) {
    throw new Error("Method 'verify()' must be implemented.");
  }
}

// Liskov Substitution Principle
class SimpleHashGenerator extends IHashGenerator {
  generateHash(file) {
    return `simple_hash_${file.name}`;
  }
}

class AdvancedHashGenerator extends IHashGenerator {
  generateHash(file) {
    return `advanced_hash_${file.name}`;
  }
}

class SimpleVerifier extends IVerifier {
  verify(hash) {
    return hash.startsWith('simple_hash_') || hash.startsWith('advanced_hash_');
  }
}

// Dependency Inversion Principle
class DocumentProcessor {
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
const DocumentVerification = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
  
    const hashGenerator = new SimpleHashGenerator();
    const verifier = new SimpleVerifier();
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