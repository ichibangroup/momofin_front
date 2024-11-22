import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import LoadingIndicator from "./components/LoadingIndicator";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./utils/ProtectedRoute";
import SpecifiedDocumentVerifier from "./components/SpecifiedDocumentVerifier";
import ViewEditRequests from "./components/ViewEditRequests";
import EditDocumentPage from "./components/EditDocumentPage";
import * as Sentry from "@sentry/react";
import { trackPageView } from "./analytics";

Sentry.init({
  dsn: "https://9174aa529b07114aa6f2c891e6a93125@o4508210717327360.ingest.de.sentry.io/4508210726174800",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Lazy load other components
const Home = lazy(() => import("./components/Home"));
const DocumentVerification = lazy(() => import("./components/DocumentVerification"));
const EditProfile = lazy(() => import("./components/EditProfile"));
const ConfigOrganisation = lazy(() => import("./components/ConfigOrganisation"));
const ViewDocuments = lazy(() => import("./components/ViewDocuments"));
const MomofinDashboard = lazy(() => import("./components/MomofinDashboard"));
const AddUserOrgAdmin = lazy(() => import("./components/AddUserOrgAdmin"));
const AddUserMomofinAdmin = lazy(() => import("./components/AddUserMomofinAdmin"));
const AddNewOrganisation = lazy(() => import("./components/AddNewOrganisation"));
const ViewOrg = lazy(() => import("./components/ViewOrg"));
const ViewOrgUsers = lazy(() => import("./components/ViewOrgUsers"));
const ViewAllUsers = lazy(() => import("./components/ViewAllUsers"));
const ViewDocumentAudits = lazy(() => import("./components/ViewDocumentAuditTrails"));
const EditUserOrgProfile = lazy(() => import("./components/EditUserOrgProfile"));

// Analytics Component
const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname); // Send pageview on route change
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <Analytics /> {/* Track pageviews dynamically */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
          <Route path="viewEditRequests" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><ViewEditRequests /></Suspense></ProtectedRoute>} />
          <Route path="editDocument/:documentId" element={<ProtectedRoute><Suspense fallback={<LoadingIndicator />}><EditDocumentPage /></Suspense></ProtectedRoute>} />
          <Route path="editUserOrgProfile/:userId" element={<Suspense fallback={<LoadingIndicator />}><EditUserOrgProfile /></Suspense>} />
        </Route>
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Suspense fallback={<LoadingIndicator />}><Login /></Suspense>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;