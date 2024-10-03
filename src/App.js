import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import LoadingIndicator from './components/LoadingIndicator';
import Login from './components/Login';
import Register from './components/Register';

// Lazy load other components
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const DocumentVerification = lazy(() => import('./components/DocumentVerification'));
const ViewOrganisation = lazy(() => import('./components/viewOrganisation'));
const ViewUsers = lazy(() => import('./components/ViewUsers'));
const EditProfile = lazy(() => import('./components/EditProfile'));
const ConfigOrganisation = lazy(() => import('./components/ConfigOrganisation'));
const ViewDocuments = lazy(() => import('./components/ViewDocuments'));

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect from root path to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login and Register routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Layout */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Suspense fallback={<LoadingIndicator />}><Home /></Suspense>} />
          <Route path="about" element={<Suspense fallback={<LoadingIndicator />}><About /></Suspense>} />
          <Route path="contact" element={<Suspense fallback={<LoadingIndicator />}><Contact /></Suspense>} />
          <Route path="verify" element={<Suspense fallback={<LoadingIndicator />}><DocumentVerification /></Suspense>} />
          <Route path="viewUsers" element={<Suspense fallback={<LoadingIndicator />}><ViewUsers /></Suspense>} />
          <Route path="viewDocuments" element={<Suspense fallback={<LoadingIndicator />}><ViewDocuments /></Suspense>} /> 
        </Route>

        {/* Route for Edit Profile */}
        <Route path="/editProfile" element={<Suspense fallback={<LoadingIndicator />}><EditProfile /></Suspense>} />
        
        {/* Route for Config Organisation */}
        <Route path="/configOrganisation" element={<Suspense fallback={<LoadingIndicator />}><ConfigOrganisation /></Suspense>} />
        
        {/* Route for View Organisation */}
        <Route path="viewOrganisation" element={<Suspense fallback={<LoadingIndicator />}><ViewOrganisation /></Suspense>} />

        {/* Auth layout routes */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Suspense fallback={<LoadingIndicator />}><Login /></Suspense>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;