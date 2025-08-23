import { motion } from "framer-motion";
import { BarChart, Leaf, Trash2, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
export default function Features() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const features = [
    {
      title: "Personalized Carbon Reports",
      description: "Track and visualize your personal digital carbon footprint with AI-powered analytics.",
      icon: <BarChart className="w-8 h-8" />,
      link: "/dashboard",
      color: "from-green-400 to-teal-500",
      bgColor: "bg-gradient-to-br from-green-500/10 to-teal-600/10",
    },
    {
      title: "Green Suggestions Assistant",
      description: "Get eco-friendly recommendations to reduce emissions from emails, storage, streaming, and more.",
      icon: <Leaf className="w-8 h-8" />,
      link: "/green-suggestions",
      color: "from-emerald-400 to-cyan-500",
      bgColor: "bg-gradient-to-br from-emerald-500/10 to-cyan-600/10",
    },
    {
      title: "Digital Declutter Assistant",
      description: "Automatically identify and clean up unused files, subscriptions, or cloud storage to save energy.",
      icon: <Trash2 className="w-8 h-8" />,
      link: "/declutter",
      color: "from-amber-400 to-yellow-500",
      bgColor: "bg-gradient-to-br from-amber-500/10 to-yellow-600/10",
    },
    {
      title: "AI Sustainability Coach",
      description: "Personalized recommendations to reduce your footprint without sacrificing productivity.",
      icon: <Building2 className="w-8 h-8" />,
      link: "/ai-coach",
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-indigo-600/10",
    },
  ];

  useEffect(() => {
    const container = document.querySelector(".particle-container");
    if (!container) return;

    const particleCount = 50;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      
      const size = Math.random() * 5 + 2;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 10 + Math.random() * 20;
      const opacity = 0.2 + Math.random() * 0.5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.opacity = opacity;
      
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Safe gradient color extraction
  const getGradientColors = (gradientString) => {
    if (!gradientString) return { from: 'green-400', to: 'teal-500' };
    
    const parts = gradientString.split(' ');
    return {
      from: parts[1]?.replace('from-', '') || 'green-400',
      to: parts[3]?.replace('to-', '') || 'teal-500'
    };
  };

  return (
    <section 
      className="min-h-screen bg-gradient-to-br from-[#0c1120] to-[#1a2035] py-20 px-4 sm:px-6 text-white relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated background elements */}
      <div className="particle-container absolute inset-0 pointer-events-none"></div>
      
      {/* Floating gradient blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl filter opacity-30 animate-float"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl filter opacity-30 animate-float-delay"></div>
      
      {/* Mouse follower gradient */}
      {hoveredIndex !== null && (
        <motion.div 
          className={`absolute w-80 h-80 rounded-full pointer-events-none bg-gradient-to-br ${features[hoveredIndex]?.color || 'from-green-400 to-teal-500'} opacity-10 blur-3xl`}
          initial={{ scale: 0.5 }}
          animate={{ 
            x: mousePosition.x - 160, 
            y: mousePosition.y - 160,
            scale: 1
          }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span 
            className="text-sm font-medium bg-white/10 px-4 py-1 rounded-full text-emerald-300 mb-4 inline-block"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            Sustainable Digital Living
          </motion.span>
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-teal-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Transform Your Digital Footprint
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Our powerful suite of tools helps you understand, reduce, and offset your digital carbon emissions with intelligent, automated solutions.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const isHovered = hoveredIndex === index;
            const colors = getGradientColors(feature.color);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative h-full"
              >
                <Link to={feature.link} className="h-full block">
                  <motion.div
                    className={`h-full rounded-2xl border border-white/10 ${feature.bgColor} p-8 backdrop-blur-lg flex flex-col transition-all duration-500 ease-in-out overflow-hidden`}
                    whileHover={{ 
                      y: -10,
                      borderColor: 'rgba(255,255,255,0.2)',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
                    }}
                    animate={{
                      borderColor: isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {/* Animated background element */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 rounded-2xl`}
                      animate={{ opacity: isHovered ? 0.1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Icon container */}
                    <motion.div
                      className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${isHovered ? `bg-gradient-to-br ${feature.color}` : 'bg-white/5'} transition-all duration-300`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <motion.div
                        animate={{ 
                          color: isHovered ? 'white' : 'currentColor',
                          scale: isHovered ? 1.2 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {feature.icon}
                      </motion.div>
                    </motion.div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 relative z-10">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-6 relative z-10">
                      {feature.description}
                    </p>
                    
                    {/* Animated button */}
                    <div className="mt-auto relative z-10">
                      <motion.div
                        className={`w-full h-10 rounded-lg flex items-center justify-center text-sm font-medium ${isHovered ? `bg-gradient-to-r ${feature.color} text-white` : 'bg-white/5 text-gray-300'}`}
                        animate={{
                          background: isHovered 
                            ? `linear-gradient(to right, var(--tw-gradient-stops))` 
                            : 'rgba(255,255,255,0.05)'
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        Learn more
                        <motion.span
                          className="ml-2"
                          animate={{ 
                            x: isHovered ? 5 : 0,
                            opacity: isHovered ? 1 : 0.7
                          }}
                        >
                          →
                        </motion.span>
                      </motion.div>
                    </div>
                    
                    {/* Glow effect */}
                    <motion.div 
                      className={`absolute -inset-1 rounded-2xl opacity-0 blur-md ${feature.bgColor}`}
                      animate={{ opacity: isHovered ? 0.4 : 0 }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Floating CTA */}
      <motion.div 
        className="mt-20 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-gray-400 mb-6">Ready to make a difference?</p>
        <motion.button
          className="px-8 py-3 rounded-full bg-gradient-to-r from-green-400 to-teal-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Your Sustainability Journey
        </motion.button>
      </motion.div>
      <Footer/>
    </section>
    
  );
}