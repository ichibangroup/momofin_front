import React from 'react';
import PropTypes from 'prop-types';
import './DashboardSection.css';
import { useNavigate } from 'react-router-dom';
import logoAvento from '../assets/logo-avento.png';  // Import the logo image

function DashboardSection({ title, actionBoxes, backgroundLines }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      {/* Background Lines */}
      {backgroundLines && <div data-testid="background-lines" className="background-lines" aria-hidden="true"></div>}

      {/* Branding Section */}
      <div className="branding">
        {/* Replace h1 with the logo */}
        <img src={logoAvento} alt="Avento Logo" className="logo" />
      </div>

      {/* Action Buttons in a Radial Layout */}
      <div className="action-radial-container">
        {actionBoxes.map((box, index) => (
          <div
            key={index}
            className={`action-box ${box.className}`}
            onClick={() => navigate(box.path)}
            role="button"
            tabIndex={0}
          >
            <div className="action-box-content">
              <h3>{box.label}</h3>
              {box.icon && (
                <div data-testid={`${box.label}-icon`}>
                  <box.icon className="action-icon" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

DashboardSection.propTypes = {
  title: PropTypes.string.isRequired,
  actionBoxes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      className: PropTypes.string.isRequired,
      icon: PropTypes.elementType, // Optional icon
    })
  ).isRequired,
  backgroundLines: PropTypes.bool, // Toggle for background decorative lines
};

export default DashboardSection;
