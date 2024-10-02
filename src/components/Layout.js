import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import api from '..//utils/api'; // import the configured axios instance

const Layout = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

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

    return (
        <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
            <header>
                <nav>
                    <ul>
                        <li><Link to="/app">Home</Link></li>
                        <li><Link to="about">About</Link></li>
                        <li><Link to="contact">Contact</Link></li>
                        <li><Link to="verify">Document Verification</Link></li>
                        <li><Link to="viewOrganisation">View Organisation</Link></li>
                    </ul>
                </nav>

                <button onClick={toggleTheme}>
                    {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>

                {/* Display user info if available */}
                {user && (
                    <div className="user-info">
                        <p>Welcome, {user.name} ({user.username})</p>
                        <p>Email: {user.email}</p>
                        <p>Position: {user.position}</p>
                        <p>Organization: {user.organization.name}</p>
                        {user.organizationAdmin && <p>You are an admin of {user.organization.name}</p>}
                        {user.momofinAdmin && <p>You are a Momofin admin</p>}
                    </div>
                )}

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
