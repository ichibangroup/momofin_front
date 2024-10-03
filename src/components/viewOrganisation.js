import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './ViewOrganisation.css'; // Import the CSS file

const ViewOrganisation = () => {
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

    return (
        <div className="view-organisation" data-testid="viewOrg-1">
            <h1 className="title">View Organisation</h1>
            <p className="description">Here you can view and manage your organization details.</p>

            {/* Back Button */}
            <button className="back-button" onClick={handleBack}>Back</button>

            {/* Placeholder for organization data */}
            <div className="placeholder-content">
                <h2 className="placeholder-title">Organization List</h2>
                <ul className="organization-list">
                    <li className="organization-item">Organization 1</li>
                    <li className="organization-item">Organization 2</li>
                    <li className="organization-item">Organization 3</li>
                </ul>
                <p className="no-organizations">No organizations to display yet. Please add an organization.</p>
            </div>
        </div>
    );
};

export default ViewOrganisation;
