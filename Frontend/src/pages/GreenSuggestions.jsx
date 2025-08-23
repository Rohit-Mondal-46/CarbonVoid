import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, useAnimation } from 'framer-motion';
import { FiCloud, FiMonitor, FiZap } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

const GreenSuggestions = ({ userId }) => {
  const [userData, setUserData] = useState({
    Dataused: 0,
    screenTime: 0,
  });
  const [co2Emission, setCo2Emission] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(false);
  const controls = useAnimation();

  // Floating leaf animation
  useEffect(() => {
    const sequence = async () => {
      while (true) {
        await controls.start({
          y: [0, -20, 0],
          x: [0, 10, 0],
          rotate: [0, 5, 0],
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        });
      }
    };
    sequence();
  }, [controls]);

  // Generate random data fallback
  const generateRandomData = () => {
    const randomCloudStorage = (Math.random() * 5 + 5).toFixed(1);
    const randomScreenTime = (Math.random() * 1 + 2).toFixed(1);
    const randomCO2 = (Math.random() * 5 + 1).toFixed(2);
    
    setUserData({ 
      cloudStorage: randomCloudStorage,
      screenTime: randomScreenTime
    });
    setCo2Emission(randomCO2);
  };

  // Generate random suggestions
  const generateRandomSuggestions = () => {
    const possibleSuggestions = [
      "Reduce cloud storage by deleting unused files (saves ~15kg CO₂/year)",
      "Lower screen brightness to 70% (saves ~8kg CO₂/year)",
      "Enable dark mode on all devices (saves ~5kg CO₂/year)",
      "Stream videos at 480p when HD isn't necessary (saves ~10kg CO₂/year)",
      "Schedule device updates during off-peak energy hours",
      "Use Wi-Fi instead of mobile data when possible (more energy efficient)",
      "Turn off auto-play on youtube"
    ];
    
    // Select 5-7 random suggestions
    const shuffled = [...possibleSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 5);
  };

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/activitystate/activity-stats/${userId}`);
        const { cloudStorage, screenTime, totalCO2 } = response.data;
        
        setUserData({ 
          cloudStorage: cloudStorage || 0,
          screenTime: screenTime || 0
        });
        setCo2Emission(totalCO2 || 0);
        setApiError(false);
      } catch (error) {
        console.error("Error fetching usage data:", error);
        setApiError(true);
        generateRandomData();
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchData();
    } else {
      // If no userId provided, use random data
      setApiError(true);
      generateRandomData();
    }
  }, [userId]);

  const getGreenSuggestions = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const response = await axios.post(`http://localhost:3000/api/suggestions/users/${userId}/reports`, userData);
      setSuggestions(response.data.suggestions || generateRandomSuggestions());
      setApiError(false);
      
      // Celebration animation when suggestions arrive
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.5 }
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setApiError(true);
      setSuggestions(generateRandomSuggestions());
      
      // Generate new random CO2 value (slightly lower than before)
      const newCO2 = (co2Emission * (0.7 + Math.random() * 0.2)).toFixed(2);
      setCo2Emission(newCO2);
    } finally {
      setLoading(false);
    }
  };

  // Floating particles animation
  const Particle = ({ size, delay, duration, x, y }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        x: [x, x + Math.random() * 100 - 50],
        y: [y, y + Math.random() * 100 - 50]
      }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        repeatDelay: Math.random() * 5
      }}
      className="absolute rounded-full bg-green-400"
      style={{
        width: size,
        height: size,
        filter: 'blur(1px)'
      }}
    />
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <Particle
            key={i}
            size={`${Math.random() * 6 + 2}px`}
            delay={Math.random() * 5}
            duration={10 + Math.random() * 20}
            x={`${Math.random() * 100}%`}
            y={`${Math.random() * 100}%`}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="container mx-auto px-4 py-16"
        >
          <div className="max-w-3xl mx-auto">
            {/* API Error Notice */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-yellow-900/50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-200">
                      {userId ? 
                        "Couldn't connect to API. Showing demo data with random values." : 
                        "Api connected"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Header with animated leaf */}
            <div className="flex justify-center mb-8 relative">
              <motion.div
                animate={controls}
                className="absolute -top-8 -left-8"
              >
                <FaLeaf className="text-green-400 text-4xl opacity-60" />
              </motion.div>
              <h1 className="text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-green-500 mb-2">
                Digital Carbon Footprint
              </h1>
              <motion.div
                animate={controls}
                className="absolute -top-8 -right-8"
              >
                <FaLeaf className="text-green-400 text-4xl opacity-60" />
              </motion.div>
            </div>

            <p className="text-center text-green-200 text-xl mb-12">
              Discover how to reduce your digital environmental impact
            </p>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Cloud Storage Card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-900/80 backdrop-blur-sm border border-green-900/50 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-green-900/20 mr-4">
                    <FiCloud className="text-green-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-100">Data used</h3>
                </div>
                <p className="text-3xl font-bold text-green-300">
                  {userData.cloudStorage} <span className="text-lg text-green-200">GB</span>
                </p>
              </motion.div>

              {/* Screen Time Card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-900/80 backdrop-blur-sm border border-green-900/50 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-green-900/20 mr-4">
                    <FiMonitor className="text-green-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-100">Screen Time</h3>
                </div>
                <p className="text-3xl font-bold text-green-300">
                  {userData.screenTime} <span className="text-lg text-green-200">hours</span>
                </p>
              </motion.div>

              {/* CO2 Emission Card */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gray-900/80 backdrop-blur-sm border border-green-900/50 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-green-900/20 mr-4">
                    <FiZap className="text-green-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-100">CO₂ Emission</h3>
                </div>
                <p className="text-3xl font-bold text-green-300">
                  {co2Emission} <span className="text-lg text-green-200">kg</span>
                </p>
              </motion.div>
            </div>

            {/* Action button */}
            <div className="flex justify-center mb-12">
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                onClick={getGreenSuggestions}
                disabled={loading}
                className={`relative overflow-hidden px-8 py-4 rounded-full text-lg font-semibold flex items-center ${
                  loading
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  <>
                    <FaLeaf className="mr-2" />
                    Get Green Suggestions
                  </>
                )}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{
                    x: loading ? [0, 300] : 0,
                    opacity: loading ? [0, 0.8, 0] : 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-white/20"
                  style={{ width: '50px', left: '-50px' }}
                />
              </motion.button>
            </div>

            {/* Suggestions section */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-green-400 text-4xl"
                    >
                      <FaLeaf />
                    </motion.div>
                  </div>
                  <p className="mt-4 text-green-200">Analyzing your digital footprint...</p>
                </div>
              ) : suggestions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-gray-900/50 rounded-xl border border-dashed border-green-900/50"
                >
                  <FaLeaf className="inline-block text-4xl text-green-400 mb-4" />
                  <h3 className="text-xl font-semibold text-green-200 mb-2">Ready to Go Green?</h3>
                  <p className="text-green-300">Click the button above to get personalized eco-friendly suggestions</p>
                </motion.div>
              ) : (
                <>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-green-500">
                      Your Green Action Plan
                    </h2>
                    <p className="text-green-300 mt-2">Here's how you can reduce your digital carbon footprint</p>
                  </motion.div>

                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-green-900/30 to-gray-900/50 backdrop-blur-sm border border-green-900/30 rounded-xl p-6 shadow-lg flex items-start"
                        whileHover={{ x: 5 }}
                      >
                        <div className="bg-green-500/20 p-2 rounded-full mr-4 mt-1">
                          <FaLeaf className="text-green-400" />
                        </div>
                        <p className="text-green-100">{suggestion}</p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: suggestions.length * 0.1 + 0.5 }}
                    className="mt-12 text-center text-green-300"
                  >
                    <p>Every small change makes a difference for our planet 🌍</p>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GreenSuggestions;