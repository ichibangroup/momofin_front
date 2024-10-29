import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import LoadingIndicator from './components/LoadingIndicator';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './utils/ProtectedRoute';
import SpecifiedDocumentVerifier from "./components/SpecifiedDocumentVerifier";

// Lazy load other components
const Home = lazy(() => import('./components/Home'));
const DocumentVerification = lazy(() => import('./components/DocumentVerification'));
const EditProfile = lazy(() => import('./components/EditProfile'));
const ConfigOrganisation = lazy(() => import('./components/ConfigOrganisation'));
const ViewDocuments = lazy(() => import('./components/ViewDocuments'));
const MomofinDashboard = lazy(() => import('./components/MomofinDashboard'));
const AddUserOrgAdmin = lazy(() => import('./components/AddUserOrgAdmin'));
const AddUserMomofinAdmin = lazy(() => import('./components/AddUserMomofinAdmin'));
const AddNewOrganisation = lazy(() => import('./components/AddNewOrganisation'));
const ViewOrg = lazy(() => import('./components/ViewOrg'));
const ViewOrgUsers = lazy(() => import('./components/ViewOrgUsers'));
const ViewAllUsers = lazy(() => import('./components/ViewAllUsers')); 
const ViewDocumentAudits = lazy(() => import('./components/ViewDocumentAuditTrails'));
const EditUserOrgProfile = lazy(() => import('./components/EditUserOrgProfile'));



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
          <Route path="/app" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><Home /></Suspense></ProtectedRoute>} />
          <Route path="verify" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><DocumentVerification /></Suspense></ProtectedRoute>} />
          <Route path="verify/:id" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><SpecifiedDocumentVerifier /></Suspense></ProtectedRoute>} />
          <Route path="viewDocuments" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><ViewDocuments /></Suspense></ProtectedRoute>} />
          <Route path="momofinDashboard" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><MomofinDashboard /></Suspense></ProtectedRoute>} />
          <Route path="editProfile/:userId" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><EditProfile /></Suspense></ProtectedRoute>} />
          <Route path="configOrganisation/addUserOrgAdmin" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><AddUserOrgAdmin /></Suspense></ProtectedRoute>} />
          <Route path="addUserMomofinAdmin" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><AddUserMomofinAdmin /></Suspense></ProtectedRoute>} />
          <Route path="configOrganisation/:id/viewOrganisationUsers" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><ViewOrgUsers /></Suspense></ProtectedRoute>} />
          <Route path="momofinDashboard/addNewOrganisation" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><AddNewOrganisation /></Suspense></ProtectedRoute>} />
          <Route path="configOrganisation/:id" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><ConfigOrganisation /></Suspense></ProtectedRoute>} />
          <Route path="configOrganisation/:id/addUserOrgAdmin" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><AddUserOrgAdmin /></Suspense></ProtectedRoute>} />
          <Route path="viewOrgUsers" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><ViewOrgUsers /></Suspense></ProtectedRoute>} />
          <Route path="viewAllUsers" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><ViewAllUsers /></Suspense></ProtectedRoute>} />
          <Route path="viewOrg" element={<Suspense fallback={<LoadingIndicator />}><ViewOrg /></Suspense>} />
          <Route path="viewDocumentAuditTrails" element={<Suspense fallback={<LoadingIndicator />}><ViewDocumentAudits /></Suspense>} />
          <Route path="editUserOrgProfile" element={<Suspense fallback={<LoadingIndicator />}><EditUserOrgProfile /></Suspense>} />
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