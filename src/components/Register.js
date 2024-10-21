import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Register.css';
import logo from '../assets/logo.png'; // Ensure the path to your logo is correct
import emailIcon from '../assets/email.svg'; // Path to email icon
import lockIcon from '../assets/lock.svg'; // Path to lock icon

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = () => {
        navigate('/app');
    };

    return (
        <div className="register-container">
            <form>
                <div className="header-container">
                    <h2>Register</h2>
                    <img src={logo} alt="Logo" className="login-logo" />
                </div>
                <div className="input-group">
                    <img src={emailIcon} alt="Email" className="input-icon"/>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        placeholder='Username'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <img src={lockIcon} alt="Password" className="input-icon"/>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="button" onClick={handleRegister}>Register</button>
                <p>Already have an account? <Link to="/login">Login instead</Link></p>
            </form>
        </div>
    );
};

export default Register;
