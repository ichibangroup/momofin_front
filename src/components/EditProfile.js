import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
    const navigate = useNavigate(); // Hook to programmatically navigate

    const handleBackClick = () => {
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <div className="edit-profile">
            <h1>Edit Profile</h1>
            <p>Here, you can edit your profile information.</p>

            <form className="profile-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" placeholder="Enter your username" />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" placeholder="Enter your email" />
                </div>

                <div className="form-group">
                    <label htmlFor="old-password">Old Password:</label>
                    <input type="password" id="old-password" placeholder="Enter your old password" />
                </div>

                <div className="form-group">
                    <label htmlFor="new-password">New Password:</label>
                    <input type="password" id="new-password" placeholder="Enter your new password" />
                </div>

                <div className="button-group">
                    <button type="button" onClick={handleBackClick} className="back-button">Back</button>
                    <button type="submit">Save Changes</button>
                    <button type="button" className="cancel-button">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
