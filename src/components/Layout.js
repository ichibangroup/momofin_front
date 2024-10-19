import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import api from '../utils/api'; // import the configured axios instance
import './Layout.css';


const Layout = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

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
    }, []); // Fetch the data when the component mounts

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div>
            <header>
                <nav>
                    <ul>
                        <li><Link to="/app">Home</Link></li>
                        <li><Link to="verify">Upload and Verify</Link></li>
                        <li><Link to="momofinDashboard">Momofin Dashboard </Link> </li>
                        <li><Link to="configOrganisation">Config Organisation</Link></li>
                        <li>
                        {user && (
                            <div className="user-dropdown">
                                <button onClick={toggleDropdown} className="dropdown-button">
                                    {user.name} <span>&#x25BC;</span>
                                </button>
                            {dropdownOpen && (
                                <ul className="dropdown-menu">
                                    <li>
                                        <Link to={`editProfile/${user.userId}`}>
                                            <button>Edit Profile</button>
                                        </Link>
                                    </li>
                                    <li><button>Log Out</button></li>
                                </ul>
                            )}
                            </div>
                        )}
                        </li>
                    </ul>
                </nav>

                {error && <p style={{ color: 'red' }}>{error}</p>}
            </header>

            <main>
                <Outlet />
            </main>

            <footer>
                <p>&copy; 2024 Your App Name. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;