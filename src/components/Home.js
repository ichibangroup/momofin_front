import React from 'react';
import '../Home.css';  
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      // Handle navigation or other actions as needed
    }
  };

  return (
    <div className="home-container">
      <div className="branding">
        <h1>MOMOFIN</h1>
        <p>A safer place to store your documents.</p>
      </div>
      
      <div className="action-boxes-container">
        <div className="action-box view-box" onClick={() => navigate('viewDocuments')} role="button" onKeyDown={handleKeyDown} style={{ cursor: 'pointer' }} tabIndex="0">
          <h3>View All Documents</h3>
        </div>

        <div className="action-box verify-box" onClick={() => navigate('verify')}  role="button" onKeyDown={handleKeyDown} style={{ cursor: 'pointer' }} tabIndex="0">
          <h3>Upload and Verify Documents</h3>
        </div>

      </div>
    </div>
  );
}

export default Home;