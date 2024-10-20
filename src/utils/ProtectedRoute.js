import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from './auth';
import PropTypes from 'prop-types';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
    const token = getAuthToken();
    const location = useLocation();

    // If no token exists, redirect to login page while saving the attempted URL
    if (!token) {
        return <Navigate to="/login" state={{ from: location.pathname, message: "You are currently unauthenticated." }}  replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired
};
export default ProtectedRoute;