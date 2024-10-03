import React from 'react';
import './ConfigOrganisation.css';

const ConfigOrganisation = () => {
  return (
    <div className="config-organisation" data-testid="config-organisation">
      <h1 className="title">Configure Organisation!</h1>
      <p className="description">This page will allow you to configure organization settings and manage related features.</p>

      <div className="placeholder-content" data-testid="placeholder-content">
        <h2 className="placeholder-title">Settings</h2>
        <p>This section will include various settings for the organization.</p>
      </div>
    </div>
  );
};

export default ConfigOrganisation;