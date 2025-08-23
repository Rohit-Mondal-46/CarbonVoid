import React, { useState, useEffect } from 'react';
import { useUser, useAuth, SignedIn, SignedOut, SignOutButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Function to send user data to backend
  const sendUserToBackend = async (clerkUser) => {
    if (!clerkUser || !isLoaded) return;
    
    setIsSyncing(true);
    setSyncError(null);

    try {
      const userData = {
        userId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || 'Anonymous',
        email: clerkUser.primaryEmailAddress?.emailAddress,
        password: null
      };

      const token = await getToken();

      const response = await fetch('http://localhost:3000/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync user data');
      }
      
      const data = await response.json();
      console.log('User synced successfully:', data);
    } catch (error) {
      console.error('Error syncing user:', error);
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync user data when user changes
  useEffect(() => {
    if (isLoaded && user) {
      sendUserToBackend(user);
    }
  }, [isLoaded, user]);

  return (
    <motion.nav
      className="w-full bg-black bg-opacity-30 backdrop-blur-lg sticky top-0 z-[100] px-6 py-4 transition-all duration-300 ease-in-out"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-400 hover:text-white transition duration-300 ease-in-out">
          CarboVoid
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 mx-auto">
          <Link to="/" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Home</Link>
          <Link to="/about" className="text-green-400 hover:text-white transition duration-300 ease-in-out">About</Link>
          <Link to="/features" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Features</Link>
          <Link to="/trends-insights" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Trends & Insights</Link>
          <Link to="/contact" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Contact</Link>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <SignedIn>
            <div className="flex items-center space-x-4">
              {isSyncing && (
                <span className="text-yellow-400 text-sm">Syncing...</span>
              )}
              {syncError && (
                <span className="text-red-400 text-sm">{syncError}</span>
              )}
              <span className="text-green-400 font-medium">
                Welcome, {user?.firstName || user?.username || 'User'}
              </span>
              <SignOutButton>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 ease-in-out">
                  Logout
                </button>
              </SignOutButton>
            </div>
          </SignedIn>

          <SignedOut>
            <Link
              to="/sign-in"
              className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 hover:text-white transition duration-300 ease-in-out font-medium"
            >
              Signup/Login
            </Link>
          </SignedOut>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-green-400 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </motion.div>
        </button>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <motion.div
          className="md:hidden mt-4 flex flex-col space-y-3"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <SignedIn>
            <div className="flex flex-col space-y-2">
              {isSyncing && (
                <span className="text-yellow-400 text-sm">Syncing...</span>
              )}
              {syncError && (
                <span className="text-red-400 text-sm">{syncError}</span>
              )}
              <span className="text-green-400 font-medium">
                Welcome, {user?.firstName || user?.username || 'User'}
              </span>
            </div>
          </SignedIn>

          <Link to="/" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Home</Link>
          <Link to="/about" className="text-green-400 hover:text-white transition duration-300 ease-in-out">About</Link>
          <Link to="/features" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Features</Link>
          <Link to="/trends-insights" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Trends & Insights</Link>
          <Link to="/contact" className="text-green-400 hover:text-white transition duration-300 ease-in-out">Contact</Link>

          <SignedIn>
            <SignOutButton>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 ease-in-out w-full">
                Logout
              </button>
            </SignOutButton>
          </SignedIn>

          <SignedOut>
            <Link
              to="/sign-in"
              className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 hover:text-white transition duration-300 ease-in-out font-medium text-center"
            >
              Signup/Login
            </Link>
          </SignedOut>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;