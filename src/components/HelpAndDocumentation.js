import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faShieldAlt, 
  faUsers, 
  faClipboardCheck, 
  faFileSignature,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import './HelpAndDocumentation.css';

const HelpAndDocumentation = () => {
  return (
    <div className="help-documentation-container">
      <div className="documentation-content">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 section-header">
          Avento Trust: Digital Document Verification
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-blue-500" />
            Project Overview
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Avento Trust is a cutting-edge document verification platform designed to enhance the security and integrity of digital documents through advanced cryptographic technology. Our mission is to provide a robust solution that guarantees document authenticity across various sectors.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            <FontAwesomeIcon icon={faClipboardCheck} className="mr-3 text-blue-500" />
            Key Features
          </h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3 className="font-bold text-blue-600 mb-2">
                <FontAwesomeIcon icon={faUpload} className="mr-2" /> 
                Document Upload
              </h3>
              <p className="text-gray-700">
                Securely upload documents within your organization. Each document receives a unique cryptographic hash for verification.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="font-bold text-blue-600 mb-2">
                <FontAwesomeIcon icon={faFileSignature} className="mr-2" /> 
                Verification Process
              </h3>
              <p className="text-gray-700">
                Verify document authenticity by comparing document hashes, ensuring no unauthorized modifications have occurred.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            <FontAwesomeIcon icon={faUsers} className="mr-3 text-blue-500" />
            User Roles
          </h2>
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="mb-4">
              <h3 className="font-bold text-blue-600 mb-2">Regular Users</h3>
              <p className="text-gray-700">
                Can upload documents, verify documents within their organization, and view document audit logs.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-blue-600 mb-2">Organization Administrators</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Edit user attributes</li>
                <li>Configure organization settings</li>
                <li>Add new users to the organization</li>
                <li>Assign or remove organization admin privileges</li>
                <li>Manage user accounts</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">
            <FontAwesomeIcon icon={faLock} className="mr-3 text-blue-500" />
            Security Principles
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Avento Trust leverages advanced cryptographic techniques to ensure:
            <ul className="list-disc list-inside mt-2">
              <li>Document Integrity</li>
              <li>Authenticity Verification</li>
              <li>Comprehensive Audit Trails</li>
              <li>Secure, Tamper-Evident Document Storage</li>
            </ul>
          </p>
        </section>

        <div className="text-center mt-8 bg-blue-100 p-4 rounded-lg">
          <p className="text-gray-700 italic">
            "Empowering trust in the digital document ecosystem through innovative cryptographic solutions."
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpAndDocumentation;