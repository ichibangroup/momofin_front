import React from 'react';
import { Link } from 'react-router-dom';
import '../Home.css';  

function Home() {
  return (
    <div className="home-container">
      <div className="branding">
        <h1>MOMOFIN</h1>
        <p>A safer place to store your documents.</p>
      </div>
      <div className="action-boxes-container">
        <div className="action-box view-box">
          <h3>View</h3>
          <Link to="/viewDocuments" className="learn-more-link">Learn More</Link>
        </div>
        <div className="action-box upload-box">
          <h3>Upload</h3>
          <Link to="/uploadDocuments" className="learn-more-link">Learn More</Link>
        </div>
        <div className="action-box verify-box">
          <h3>Verify</h3>
          <Link to="/verifyDocuments" className="learn-more-link">Learn More</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;