import React, { useState } from 'react';
import './ConfigOrganisation.css';
import { Link } from 'react-router-dom';


const ConfigOrganisation = () => {
  const [name, setName] = useState('ICHIBAN GROUP');
  const [industry, setIndustry] = useState('Medicine');
  const [address, setAddress] = useState('25 Plainsboro Rd, Princeton, NJ 08540, United States');
  const [description, setDescription] = useState('');

  return (
    <div className="config-organisation" data-testid="config-organisation">
      <header className="header">
        <button className="menu-button">☰</button>
        <h1 className="title">Configure Organisation</h1>
        <div className="logo">🔹</div>
      </header>
      
      <main className="main-content">
        <div className="org-info">
          <div className="org-image"></div>
          <div className="org-details">
            <h2>Ichiban Group</h2>
            <p>MAIN ADMIN: Galih Ibrahim Kurniawan</p>
            <p>25 Plainsboro Rd, Princeton, NJ 08540, United States</p>
            <p>Medicine Industry</p>

            <button className="add-user-button">
            <Link to="addUserOrgAdmin">ADD USER</Link>
            </button>

            <button className="add-user-button">
            <Link to="viewOrganisationUsers">VIEW ORG USERS LIST</Link>
            </button>
            
          </div>
        </div>

        <section className="general-section">
          <h3>General</h3>
          <form>
            <div className="form-group">
              <label htmlFor="name">NAME</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="industry">INDUSTRY</label>
              <input type="text" id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="address">ADDRESS</label>
              <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="description">DESCRIPTION</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
          </form>
        </section>
      </main>

      <footer className="footer">
        <button className="cancel-button">CANCEL</button>
        <button className="save-button">SAVE</button>
      </footer>
    </div>
  );
};

export default ConfigOrganisation;