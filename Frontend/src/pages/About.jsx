// src/pages/About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const features = [
  "Live Carbon Emission Estimator",
  "AI Assistant for Sustainability Tips",
  "Smart Feed of Community Actions",
  "Personal & Team Carbon Reports",
  "Eco-mode & Digital Declutter Plans"
];

const About = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-emerald-950 to-black text-white px-6 py-20 overflow-hidden">
      {/* Floating Leaves Emoji in the Background */}
      <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
        {[...Array(30)].map((_, index) => {
          const startX = Math.random() * 100;
          const xDrift = Math.random() * 16 - 8; // Closer horizontal spread

          return (
            <motion.div
              key={index}
              className="absolute text-3xl"
              style={{
                top: `${Math.random() * 100}vh`,
                left: `${startX}vw`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.5,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
              animate={{
                y: ["0", "110vh"],
                x: [`${startX}vw`, `${startX + xDrift}vw`],
              }}
              transition={{
                duration: Math.random() * 20 + 20, // 20–40s
                repeat: Infinity,
                ease: "linear",
              }}
            >
              🍃
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto pb-32">
        {/* Hero Section */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-300 via-lime-200 to-yellow-200 text-transparent bg-clip-text mb-8"
        >
          Empowering a Cleaner Digital Future
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl text-green-100/80 mb-12 max-w-3xl"
        >
          CarboVoid helps individuals and organizations track, understand, and reduce their digital carbon emissions. We merge tech, AI, and sustainability to create a greener digital experience.
        </motion.p>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-emerald-900/30 p-6 rounded-2xl backdrop-blur-md hover:bg-green-700/10 transition border border-green-400/20 shadow hover:shadow-emerald-400/30"
            >
              <h3 className="text-xl font-semibold text-lime-300 transition duration-300">
                {feature}
              </h3>
              <p className="text-green-100/70 text-sm mt-2">
                Learn how this feature helps lower emissions and encourages sustainability.
              </p>
            </div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16"
        >
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-lime-300 to-green-500 text-black font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lime-400/30"
          >
            Connect with Us →
          </motion.a>
        </motion.div>
      </div>

      <div>
        <Footer />
      </div>
    </section>
  );
};

export default About;
