import React from 'react';
import { Link } from 'react-router-dom';
import '../Home.css';  

function MomofinDashboard() {
  return (
    <div className="home-container">
      <div className="branding">
        <h1>MOMOFIN</h1>
        <p>A safer place to store your documents.</p>
      </div>
      <div className="action-boxes-container">
        <div className="action-box view-box">
          <h3>View All Users</h3>
          <Link to="/app/viewUsers" className="learn-more-link">Learn More</Link>
        </div>

        <div className="action-box verify-box">
          <h3>View All Organisations</h3>
          <Link to="/app/viewOrganisation" className="learn-more-link">Learn More</Link>
        </div>
      </div>
    </div>
  );
}

export default MomofinDashboard;