import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faUpload, faHome, faBorderAll, faAddressBook, faAddressCard, faLongArrowAltLeft, faLongArrowAltRight, faSignOut} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import './Layout.css';

const Layout = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await api.get('/auth/info');
                setUser(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch user information');
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        // Implement logout logic here
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsActive(!isActive);
    };

    return (
        <div className={`wrapper ${isActive ? 'active' : ''}`} data-testid="wrapper">
            <div className="top_navbar">
                <div className="logo">
                    <Link to="/app">MOMOFIN</Link>
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
                            <li>
                                <Link to="momofinDashboard">
                                    <span className="icon"><FontAwesomeIcon icon={faAddressBook} /></span>
                                    <span className="list">Momofin Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="configOrganisation">
                                    <span className="icon"><FontAwesomeIcon icon={faCogs} /></span>
                                    <span className="list">Config Organisation</span>
                                </Link>
                            </li>
                            {user && (
                                <>
                                    <li>
                                        <Link to={`editProfile/${user.userId}`}>
                                            <span className="icon"><FontAwesomeIcon icon={faAddressCard} /></span>
                                            <span className="list">Edit Profile</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="#" onClick={handleLogout}>
                                            <span className="icon"><FontAwesomeIcon icon={faSignOut} /></span>
                                            <span className="list">Log Out</span>
                                        </a>
                                    </li>
                                </>
                            )}
                        </ul>

                        <div className="hamburger" onClick={toggleSidebar} data-testid="hamburger">
                            <div className="inner_hamburger">
                                <span className="arrow">
                                    <FontAwesomeIcon icon={faLongArrowAltLeft} className="fa-long-arrow-alt-left" />
                                    <FontAwesomeIcon icon={faLongArrowAltRight} className="fa-long-arrow-alt-right" />
                                </span>
                            </div>
                        </div>
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