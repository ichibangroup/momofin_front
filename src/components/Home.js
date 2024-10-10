import React from 'react';
import '../Home.css';  
import { useNavigate } from 'react-router-dom';


function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="branding">
        <h1>MOMOFIN</h1>
        <p>A safer place to store your documents.</p>
      </div>
      
      <div className="action-boxes-container">
        <div className="action-box view-box" onClick={() => navigate('viewDocuments')} style={{ cursor: 'pointer' }}>
          <h3>View Documents</h3>
        </div>

        <div className="action-box verify-box" onClick={() => navigate('verify')} style={{ cursor: 'pointer' }}>
          <h3>Upload and Verify Documents</h3>
        </div>

      </div>
    </div>
  );
}

export default Home;