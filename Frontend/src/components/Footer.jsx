import React from 'react';
import { FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="border-t border-green-900 text-white py-8 mt-16 px-6 relative z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Left Side - Quick Links */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-green-500">Home</a></li>
              <li><a href="/about" className="hover:text-green-500">About</a></li>
              <li><a href="/carbon-emission" className="hover:text-green-500">Features</a></li>
              <li><a href="/trends-insights" className="hover:text-green-500">Trends & Insights</a></li>
              <li><a href="/contact" className="hover:text-green-500">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Middle - Waitlist Signup */}
        <div className="mt-8 md:mt-0 flex flex-col items-center text-center">
          <h3 className="text-lg font-semibold mb-4">Join the Waitlist</h3>
          <p className="mb-4">Stay updated on our mission to reduce carbon emissions.</p>
          <form action="#" method="post" className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded-lg text-black w-64"
            />
            <button type="submit" className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300">Subscribe</button>
          </form>
        </div>

        {/* Right Side - Social Icons */}
        <div className="mt-8 md:mt-0 flex flex-col items-center md:items-end">
          <div className="flex space-x-4 mb-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-green-400 transition duration-300 transform hover:scale-110"
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-green-400 transition duration-300 transform hover:scale-110"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-green-400 transition duration-300 transform hover:scale-110"
            >
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Center - Copyright */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-gray-400 text-center">
          <p>© 2025 CarboVoid, All rights reserved.</p>
          <p className="sm:ml-4">Partners: <span className="font-semibold">GreenTech, EcoPartnership</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
