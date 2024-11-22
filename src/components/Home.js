import React, { useEffect, useState } from 'react';
import '../Home.css';  
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js'; // Import API instance

function Home() {
  const navigate = useNavigate();
  const [, setUserRoles] = useState([]); // State to store roles array

  // Function to fetch user info
  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/auth/info'); // Call the API
      setUserRoles(response.data.roles); // Set the roles from response
    } catch (error) {
      console.error('Error fetching user info:', error); // Handle error
    }
  };

  useEffect(() => {
    fetchUserInfo(); // Fetch user info on component mount
  }, []);

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
        <div 
          className="action-box view-box" 
          onClick={() => navigate('viewDocuments')} 
          role="button" 
          onKeyDown={handleKeyDown} 
          style={{ cursor: 'pointer' }}
        >
          <h3>View Documents</h3>
        </div>

        <div 
          className="action-box verify-box" 
          onClick={() => navigate('verify')}  
          role="button" 
          onKeyDown={handleKeyDown} 
          style={{ cursor: 'pointer' }}
        >
          <h3>Upload and Verify Documents</h3>
        </div>

        <div 
          className="action-box audit-box" 
          onClick={() => navigate('viewDocumentAuditTrails')}  
          role="button" 
          onKeyDown={handleKeyDown} 
          style={{ cursor: 'pointer' }}
        >
          <h3>View Document Audit Trails</h3>
        </div>
      </div>
    </div>
  );
}

export default Home;
