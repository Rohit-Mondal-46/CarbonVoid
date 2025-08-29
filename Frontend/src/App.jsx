import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from './contexts/AuthContext';

import Dashboard from './pages/Dashboard';
import GreenSuggestions from './pages/GreenSuggestions';
import Declutter from './pages/Declutter';
import ChatWidget from './components/ChatWidget';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';
import TrendsInsights from './pages/TrendsInsights';
import AuthCallback from './pages/AuthCallback';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Router>
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/trends-insights" element={<TrendsInsights />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/green-suggestions"
            element={
              <ProtectedRoute>
                <GreenSuggestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/declutter"
            element={
              <ProtectedRoute>
                <Declutter />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Route */}
          <Route
            path="*"
            element={
              <div className="p-8 text-center text-lg">404 - Page not found</div>
            }
          />
        </Routes>

        {/* Floating ChatWidget on All Signed-In Pages */}
        <SignedIn>
          <ChatWidget />
        </SignedIn>
      </Router>
    </div>
  );
};

export default App;