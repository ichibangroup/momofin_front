import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCogs, faUpload, faClipboardList, faHome, faBorderAll, faAddressBook,
    faAddressCard, faLongArrowAltLeft, faLongArrowAltRight, faSignOut, faFileSignature, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import './Layout.css';
import { setAuthToken } from "../utils/auth";
import { LogoutActivityLogger } from '../utils/logoutLogger';
import logoAvento from '../assets/logo-avento.png';

const Layout = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [editRequestsCount, setEditRequestsCount] = useState(0);
    const fetchEditRequestsCount = async () => {
        try {
            const response = await api.get('/doc/edit-request');
            // Assuming the response includes an array of edit requests
            setEditRequestsCount(response.data.length);
        } catch (err) {
            console.error('Failed to fetch edit requests count:', err);
        }
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get('/auth/info');
                if (!response.data) {
                    // Handle case where no user data is returned
                    setAuthToken(); // Set the auth token (clear if needed)
                    navigate('/login');
                    return;
                }
                setUser(response.data);
                setError(null);
                fetchEditRequestsCount();
            } catch (err) {
                setError('Failed to fetch user information');
                setAuthToken(); // Set the auth token (clear if needed)
                navigate('/login');
            }
        };
    
        fetchUserInfo();
    }, [navigate]);
    
    const handleLogout = async () => {
        if (user) {
            // Log logout attempt
            LogoutActivityLogger.logLogoutAttempt(
                user.userId,
                user.organization?.organizationId
            );

            try {
                // Optional: Call logout endpoint if you have one
                // await api.post('/auth/logout');

                // Log successful logout
                LogoutActivityLogger.logLogoutSuccess(
                    user.userId,
                    user.organization?.organizationId,
                    user.username
                );

                // Clear auth token
                setAuthToken();

                // Log navigation after logout
                LogoutActivityLogger.logNavigationAfterLogout(
                    location.pathname,
                    '/login'
                );

                // Redirect to login
                navigate('/login', { 
                    state: { message: 'You have been successfully logged out.' }
                });
            } catch (error) {
                // Log logout failure
                LogoutActivityLogger.logLogoutFailure(
                    user.userId,
                    user.organization?.organizationId,
                    error
                );

                console.error('Logout failed:', error);
                setError('Failed to logout properly');
                
                // Still clear token and redirect even if logging fails
                setAuthToken();
                navigate('/login');
            }
        } else {
            // If no user data, just redirect
            setAuthToken();
            navigate('/login');
        }
    };

    const toggleSidebar = () => {
        setIsActive(!isActive);
    };

    // Helper functions to check roles
    const hasRole = (role) => user?.roles?.includes(role);

    return (
        <div className={`wrapper ${isActive ? 'active' : ''}`} data-testid="wrapper">
            <div className="top_navbar">
                <div className="logo">
                <img src={logoAvento} alt="Logo Avento" style={{ width: '140px', height: 'auto' }} />
                </div>
                <div className="top_menu">
                    <div className="home_link">
                        <Link to="/app">
                            <span className="icon"><FontAwesomeIcon icon={faHome} /></span>
                            <span>Home</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="main_body">
                <div className="sidebar_menu">
                    <div className="inner__sidebar_menu">
                        <ul>
                            <li>
                                <Link to="/app">
                                    <span className="icon"><FontAwesomeIcon icon={faBorderAll} /></span>
                                    <span className="list">Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="verify">
                                    <span className="icon"><FontAwesomeIcon icon={faUpload} /></span>
                                    <span className="list">Upload and Verify</span>
                                </Link>
                                </li>
                            {hasRole('ROLE_ORG_ADMIN') && (
                                <li>
                                    <Link to="viewDocumentAuditTrails">
                                    <span className="icon"><FontAwesomeIcon icon={faClipboardList} /></span>
                                    <span className="list">View Audit Logs</span>
                                    </Link>
                                </li>
                            )}
                            {hasRole('ROLE_MOMOFIN_ADMIN') && (
                                <li>
                                    <Link to="momofinDashboard">
                                        <span className="icon"><FontAwesomeIcon icon={faAddressBook} /></span>
                                        <span className="list">Momofin Dashboard</span>
                                    </Link>
                                </li>
                            )}
                            {hasRole('ROLE_ORG_ADMIN') && (
                                <li>
                                    <Link to={`configOrganisation/${user?.organization?.organizationId}`}>
                                        <span className="icon"><FontAwesomeIcon icon={faCogs} /></span>
                                        <span className="list">Config Organisation</span>
                                    </Link>
                                </li>
                            )}
                            {user && (
                                <>
                                    <li>
                                        <Link to={`editProfile/${user.userId}`}>
                                            <span className="icon"><FontAwesomeIcon icon={faAddressCard}/></span>
                                            <span className="list">Edit Profile</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={`viewEditRequests`}>
                                            <span className="icon"><FontAwesomeIcon icon={faFileSignature}/></span>
                                            <span className="list">
                                                View Edit Requests
                                                {editRequestsCount > 0 && (
                                                    <span className="badge">{editRequestsCount}</span>
                                                )}
                                            </span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="help">
                                            <span className="icon"><FontAwesomeIcon icon={faQuestionCircle}/></span>
                                            <span className="list">Help & Documentation</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="/login" onClick={(e) => {
                                            e.preventDefault();
                                            handleLogout();
                                        }}>
                                            <span className="icon"><FontAwesomeIcon icon={faSignOut}/></span>
                                            <span className="list">Log Out</span>
                                        </a>
                                    </li>
                                </>
                            )}
                        </ul>

                        <button
                            className="hamburger"
                            onClick={toggleSidebar}
                            data-testid="hamburger"
                            aria-label="Toggle sidebar"
                            type="button"
                        >
                            <div className="inner_hamburger">
                                <span className="arrow">
                                    <FontAwesomeIcon icon={faLongArrowAltLeft} className="fa-long-arrow-alt-left"/>
                                    <FontAwesomeIcon icon={faLongArrowAltRight} className="fa-long-arrow-alt-right" />
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="container">
                    {error && <p className="error-message">{error}</p>}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;