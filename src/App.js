import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import LoadingIndicator from './LoadingIndicator';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));
const Contact = lazy(() => import('./Contact'));

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
