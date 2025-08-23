import React from 'react';
import { motion } from 'framer-motion';
import { Sparkle } from 'lucide-react';

const DeclutterAndStats = ({ suggestions, stats }) => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto px-6 py-10 bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl shadow-2xl">
      {/* Declutter Suggestions Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-700 flex items-center gap-3">
          <Sparkle className="text-blue-500 animate-pulse" />
          <span>Declutter Your Digital Space</span>
        </h2>

        {suggestions.length === 0 ? (
          <p className="text-gray-500 italic">No declutter suggestions available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion._id}
                className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl border border-blue-100 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                <p className="text-sm text-gray-700">
                  <strong>Impact:</strong> {suggestion.impact}
                </p>
                <a
                  href={suggestion.actionLink}
                  className="mt-3 inline-block text-sm text-indigo-600 hover:underline transition-all hover:text-indigo-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🚀 Take Action
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Carbon Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-green-700 flex items-center gap-3">
          <Sparkle className="text-green-500 animate-spin-slow" />
          <span>Your Digital Carbon Emission</span>
        </h2>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-green-100">
          <ul className="space-y-4 text-gray-700 text-sm md:text-base">
            <li className="flex justify-between items-center">
              <span className="font-medium">🎥 youtube:</span>
              <span className="text-green-600 font-semibold">{stats.videoStreaming} g CO₂</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default DeclutterAndStats;
