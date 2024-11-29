import React from 'react';
import DashboardSection from './DashboardSection';
import { FaFileAlt, FaCloudUploadAlt, FaClipboardList } from 'react-icons/fa';

function Home() {
  const actionBoxes = [
    { label: 'View Documents', path: 'viewDocuments', className: 'view-box', icon: FaFileAlt },
    { label: 'Upload and Verify Documents', path: 'verify', className: 'verify-box', icon: FaCloudUploadAlt },
    { label: 'View Audit Logs', path: 'viewDocumentAuditTrails', className: 'audit-box', icon: FaClipboardList },
  ];

  return (
    <DashboardSection
      title="AVENTO"
      actionBoxes={actionBoxes}
      backgroundLines={true}
    />
  );
}

export default Home;
