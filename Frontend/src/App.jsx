import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  UserProfile,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  ClerkLoaded,
  ClerkLoading
} from '@clerk/clerk-react';

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

const App = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      <ClerkLoading>
        <div className="p-4 text-center">Loading...</div>
      </ClerkLoading>

      <ClerkLoaded>
        <Router>
          <Navbar />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<ClerkSignIn routing="path" path="/sign-in" />} />
            <Route path="/sign-up" element={<ClerkSignUp routing="path" path="/sign-up" />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path='/trends-insights' element={<TrendsInsights />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <SignedIn>
                  <Dashboard />
                </SignedIn>
              }
            />
            <Route
              path="/green-suggestions"
              element={
                <SignedIn>
                  <GreenSuggestions />
                </SignedIn>
              }
            />
            <Route
              path="/declutter"
              element={
                <SignedIn>
                  <Declutter />
                </SignedIn>
              }
            />
            <Route
              path="/profile"
              element={
                <SignedIn>
                  <UserProfile />
                </SignedIn>
              }
            />

            {/* Catch-all Route */}
            <Route
              path="*"
              element={
                <>
                  <SignedIn>
                    <div className="p-8 text-center text-lg">404 - Page not found</div>
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
          </Routes>

          {/* Floating ChatWidget on All Signed-In Pages */}
          <SignedIn>
            <ChatWidget />
          </SignedIn>
        </Router>
      </ClerkLoaded>
    </div>
  );
};

export default App;