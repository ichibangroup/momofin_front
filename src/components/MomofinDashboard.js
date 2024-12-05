import React from 'react';
import DashboardSection from './DashboardSection';
import { FaUsers, FaBuilding } from 'react-icons/fa'; // Example icons

function MomofinDashboard() {
  const actionBoxes = [
    { label: 'View All Users', path: '/app/viewAllUsers', className: 'view-box', icon: FaUsers },
    { label: 'View All Organisations', path: '/app/viewOrg', className: 'verify-box', icon: FaBuilding },
  ];

  return (
    <DashboardSection
      title="AVENTO"
      actionBoxes={actionBoxes}
      backgroundLines={true}
    />
  );
}

export default MomofinDashboard;
