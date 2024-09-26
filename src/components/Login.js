// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

const handleLogin = () => {
    // For now, just navigate to the Layout (main app) after login button is clicked
    navigate('/app');
};

return (
    <div>
        <h2>Login</h2>
        <form>
        <div>
            <label>Username</label>
            <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
        </div>
        <div>
            <label>Password</label>
            <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
        </div>
        <button type="button" onClick={handleLogin}>Login</button>
        </form>
    </div>
    );
};

export default Login;
