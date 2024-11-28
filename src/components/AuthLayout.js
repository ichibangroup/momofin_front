import React from 'react';
import { Outlet } from 'react-router-dom';

//RAHHHHHHHH
const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
