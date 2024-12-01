import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import './DashboardSection.css';
import { useNavigate } from 'react-router-dom';
import logoAvento from '../assets/logo-avento.png';

function DashboardSection({ title, actionBoxes, backgroundLines }) {
  const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('unscrollable');

        return () => {
            document.body.classList.remove('unscrollable');
        };
    }, []);

  const handleKeyDown = (box, index, event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      navigate(box.path);
    }
  };

  //REAHHHHHHHHH 
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
            onKeyDown={(event) => handleKeyDown(box, index, event)}
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