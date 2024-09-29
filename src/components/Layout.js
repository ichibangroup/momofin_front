import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';

const Layout = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
      <header>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/verify">Document Verification</Link></li>
            <li><Link to="/viewOrganisation">View Organisation</Link></li>
          </ul>
        </nav>

        <button onClick={toggleTheme}>
          {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        
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