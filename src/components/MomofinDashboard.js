import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Home.css';

function MomofinHome() {
  const navigate = useNavigate();

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // Handle navigation or other actions as needed
    }
  };


  // RAHHHHHHHH
  return (
    <div className="home-container">
      <div className="branding">
        <h1>MOMOFIN</h1>
        <p>A safer place to store your documents.</p>
      </div>

      <div className="action-boxes-container">
        <div className="action-box view-box" onClick={() => navigate('/app/viewAllUsers')} onKeyDown={handleKeyDown} role="button">
          <h3>View All Users</h3>
        </div>

        <div className="action-box verify-box" onClick={() => navigate('/app/viewOrg')} onKeyDown={handleKeyDown} role="button">
          <h3>View All Organisations</h3>
        </div>
      </div>
    </div>
  );
}

export default MomofinHome;