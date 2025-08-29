import React, { useState } from 'react';
import { useUser, useAuth, SignedIn, SignedOut, SignOutButton } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { isLoaded, user } = useUser();
  const { login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
              <span className="text-green-400 font-medium">
                Welcome, {user?.name || 'User'}
              </span>
              <SignOutButton>
                <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300 ease-in-out">
                  Logout
                </button>
              </SignOutButton>
            </div>
          </SignedIn>

          <SignedOut>
            <button
              onClick={login}
              className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 hover:text-white transition duration-300 ease-in-out font-medium"
            >
              Login with Google
            </button>
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
              <span className="text-green-400 font-medium">
                Welcome, {user?.name || 'User'}
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
            <button
              onClick={login}
              className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-400 hover:text-white transition duration-300 ease-in-out font-medium text-center"
            >
              Login with Google
            </button>
          </SignedOut>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;