import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import LoadingIndicator from './components/LoadingIndicator';

const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const DocumentVerification = lazy(() => import('./components/DocumentVerification'));
const Login = lazy(() => import('./components/Login'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<LoadingIndicator />}>
              <Home />
            </Suspense>
          } />
          <Route path="about" element={
            <Suspense fallback={<LoadingIndicator />}>
              <About />
            </Suspense>
          } />
          <Route path="contact" element={
            <Suspense fallback={<LoadingIndicator />}>
              <Contact />
            </Suspense>
          } />
          <Route path="verify" element={
            <Suspense fallback={<LoadingIndicator />}>
              <DocumentVerification />
            </Suspense>
          } />
        </Route>
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={
            <Suspense fallback={<LoadingIndicator />}>
              <Login />
            </Suspense>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
