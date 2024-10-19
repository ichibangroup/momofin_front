import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import LoadingIndicator from './components/LoadingIndicator';
import Login from './components/Login';
import Register from './components/Register';

// Lazy load other components
const Home = lazy(() => import('./components/Home'));
const DocumentVerification = lazy(() => import('./components/DocumentVerification'));
const ViewOrganisation = lazy(() => import('./components/viewOrganisation'));
const ViewUsers = lazy(() => import('./components/ViewUsers'));
const EditProfile = lazy(() => import('./components/EditProfile'));
const ConfigOrganisation = lazy(() => import('./components/ConfigOrganisation'));
const ViewDocuments = lazy(() => import('./components/ViewDocuments'));
const MomofinDashboard = lazy(() => import('./components/MomofinDashboard'));
const AddUserOrgAdmin = lazy(() => import('./components/AddUserOrgAdmin'));
const AddUserMomofinAdmin = lazy(() => import('./components/AddUserMomofinAdmin'));
const ViewOrganisationUsers = lazy(() => import('./components/ViewOrganisationUsers'));
const AddNewOrganisation = lazy(() => import('./components/AddNewOrganisation'));
const ViewOrgUsers = lazy(() => import('./components/ViewOrgUsers')); 


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
          <Route path="/app" element={<Suspense fallback={<LoadingIndicator />}><Home /></Suspense>} />
          <Route path="verify" element={<Suspense fallback={<LoadingIndicator />}><DocumentVerification /></Suspense>} />
          <Route path="viewUsers" element={<Suspense fallback={<LoadingIndicator />}><ViewUsers /></Suspense>} />
          <Route path="viewDocuments" element={<Suspense fallback={<LoadingIndicator />}><ViewDocuments /></Suspense>} /> 
          <Route path="momofinDashboard" element={<Suspense fallback={<LoadingIndicator />}><MomofinDashboard /></Suspense>} /> 
          <Route path="viewOrganisation" element={<Suspense fallback={<LoadingIndicator />}><ViewOrganisation /></Suspense>} />
          <Route path="editProfile/:userId" element={<Suspense fallback={<LoadingIndicator />}><EditProfile /></Suspense>} />
          <Route path="configOrganisation/addUserOrgAdmin" element={<Suspense fallback={<LoadingIndicator />}><AddUserOrgAdmin /></Suspense>} />
          <Route path="addUserMomofinAdmin" element={<Suspense fallback={<LoadingIndicator />}><AddUserMomofinAdmin /></Suspense>} />
          <Route path="configOrganisation/:id/viewOrganisationUsers" element={<Suspense fallback={<LoadingIndicator />}><ViewOrganisationUsers /></Suspense>} />
          <Route path="momofinDashboard/addNewOrganisation" element={<Suspense fallback={<LoadingIndicator />}><AddNewOrganisation /></Suspense>} />
          <Route path="configOrganisation/:id" element={<Suspense fallback={<LoadingIndicator />}><ConfigOrganisation /></Suspense>} />
          <Route path="configOrganisation/:id/addUserOrgAdmin" element={<Suspense fallback={<LoadingIndicator />}><AddUserOrgAdmin /></Suspense>} />
          <Route path="viewOrgUsers" element={<Suspense fallback={<LoadingIndicator />}><ViewOrgUsers /></Suspense>} /> 
        </Route>

        {/* Auth layout routes */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Suspense fallback={<LoadingIndicator />}><Login /></Suspense>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;