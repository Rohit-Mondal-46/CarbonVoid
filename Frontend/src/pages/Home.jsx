import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import {
  motion,
  useAnimation,
  useScroll,
  AnimatePresence,
} from "framer-motion";
import Globe from "../components/Globe";
import Footer from "../components/Footer";
import CarbonModeToggle from "../components/CarbonModeToggle";
import { FiArrowUp, FiStar, FiCheckCircle } from "react-icons/fi";
import { FaLeaf, FaChartLine, FaMagic, FaDatabase } from "react-icons/fa";

const activities = {
  email: {
    label: "Emails Sent",
    placeholder: "Enter number of emails",
    factor: 0.004,
    icon: "📧",
    color: "from-blue-400 to-cyan-400",
  },
  zoom: {
    label: "Zoom Meeting Hours",
    placeholder: "Enter number of hours",
    factor: 0.1,
    icon: "🎥",
    color: "from-purple-400 to-indigo-400",
  },
  download: {
    label: "Downloads (GB)",
    placeholder: "Enter data in GB",
    factor: 0.02,
    icon: "💾",
    color: "from-amber-400 to-orange-400",
  },
  youtube: {
    label: "YouTube Watch Hours",
    placeholder: "Enter watch time in hours",
    factor: 0.08,
    icon: "📺",
    color: "from-red-400 to-pink-400",
  },
};

const iconVariants = {
  hover: {
    scale: 1.3,
    rotate: [0, 10, -10, 0],
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10,
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
  tap: {
    scale: 0.9,
  },
};

const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

const textGlowVariants = {
  hidden: {
    opacity: 0,
    textShadow: "0 0 0px rgba(74, 222, 128, 0)",
  },
  visible: {
    opacity: 1,
    textShadow: [
      "0 0 0px rgba(74, 222, 128, 0)",
      "0 0 10px rgba(74, 222, 128, 0.5)",
      "0 0 20px rgba(74, 222, 128, 0.3)",
      "0 0 10px rgba(74, 222, 128, 0.5)",
      "0 0 0px rgba(74, 222, 128, 0)",
    ],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const Home = () => {
  const { user } = useUser();
  const [emission, setEmission] = useState(0);
  const [activity, setActivity] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [carbonResult, setCarbonResult] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const controls = useAnimation();
  const { scrollYProgress } = useScroll();

  const aiSuggestions = [
    {
      text: "Switch to audio-only mode during Zoom calls to reduce emissions by up to 96%.",
      icon: "🎧",
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
    },
    {
      text: "Unsubscribe from promotional emails - 65 billion spam emails are sent daily, wasting energy.",
      icon: "📧",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
    },
    {
      text: "Stream content instead of downloading when possible - saves repeated data transfers.",
      icon: "📲",
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
    {
      text: "Watch YouTube at 480p instead of 1080p to cut emissions by half.",
      icon: "📺",
      color: "bg-gradient-to-br from-red-500 to-pink-600",
    },
    {
      text: "Use dark mode on devices with OLED screens to reduce energy consumption by up to 60%.",
      icon: "🌙",
      color: "bg-gradient-to-br from-gray-700 to-gray-900",
    },
    {
      text: "Delete old emails and cloud files - stored data consumes energy in data centers.",
      icon: "🗑️",
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      text: "Limit video conferencing when audio is sufficient - video increases data usage 10x.",
      icon: "🎤",
      color: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
    },
    {
      text: "Use WiFi instead of mobile data - it's typically 2-3 times more energy efficient.",
      icon: "📶",
      color: "bg-gradient-to-br from-sky-500 to-blue-600",
    },
  ];
  const [activeTips, setActiveTips] = useState([0, 1, 2]);

  const userReviews = [
    {
      name: "Alex Johnson",
      role: "Sustainability Manager",
      avatar: "👨‍💼",
      review:
        "CarboVoid helped our company reduce digital emissions by 28% in just 3 months!",
      rating: 5,
    },
    {
      name: "Sarah Williams",
      role: "Digital Nomad",
      avatar: "👩‍💻",
      review:
        "The AI suggestions are incredibly practical. I've cut my carbon footprint without changing my workflow.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "IT Director",
      avatar: "👨‍🔧",
      review:
        "The ESG reports saved us dozens of hours in sustainability reporting. Highly recommended!",
      rating: 4,
    },
    {
      name: "Emma Rodriguez",
      role: "Environmental Activist",
      avatar: "👩‍🌾",
      review:
        "Finally a tool that makes digital carbon footprint tangible and actionable.",
      rating: 5,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmission((prev) =>
        parseFloat((prev + Math.random() * 0.002).toFixed(4))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAiSuggestions = async () => {
    const mockApiResponse = {
      email:
        "Consider unsubscribing from promotional emails to reduce unnecessary data storage and transfers.",
      zoom: "Switch to audio-only mode during Zoom calls to reduce video data transmission by up to 96%.",
      download:
        "Opt for streaming rather than downloading when you'll only view content once to avoid duplicate data transfers.",
      youtube:
        "Choose 480p resolution for YouTube videos - it uses about 1/4 the data of 1080p with minimal quality loss for most content.",
    };

    setAiSuggestion(mockApiResponse[activity]);
  };

  const estimateCarbon = () => {
    if (!activity || !inputValue) return;

    const factor = activities[activity].factor;
    const result = inputValue * factor;
    setCarbonResult(result.toFixed(2));

    fetchAiSuggestions();

    const utterance = new SpeechSynthesisUtterance(
      `You generated ${result.toFixed(
        2
      )} kilograms of carbon dioxide. AI suggests: ${aiSuggestion}`
    );
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTips((prev) => [
        (prev[0] + 1) % aiSuggestions.length,
        (prev[1] + 1) % aiSuggestions.length,
        (prev[2] + 1) % aiSuggestions.length,
      ]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      textShadow: "0 0 10px rgba(74, 222, 128, 0.7)",
      transition: {
        duration: 0.3,
        yoyo: Infinity,
      },
    },
  };

  const welcomeVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  const renderWelcomeText = () => {
    const text = "Welcome to CarboVoid";
    return text.split("").map((char, i) => (
      <motion.span
        key={i}
        variants={letterVariants}
        style={{ display: "inline-block" }}
        className={char === " " ? "mx-1" : ""}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ));
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden text-white bg-gradient-to-br from-gray-900 to-black">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-green-400/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 10 + 2,
              height: Math.random() * 10 + 2,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />

      {/* Globe Background */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Globe />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={welcomeVariants}
            className="text-5xl md:text-7xl font-extrabold mb-6"
          >
            <motion.span className="text-white/90">Welcome to </motion.span>
            <motion.span
              className="bg-gradient-to-r from-green-300 via-emerald-400 to-green-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                },
              }}
            >
              CarboVoid
            </motion.span>
            <motion.span
              className="text-emerald-300 ml-2"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              🌍
            </motion.span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Track, analyze, and reduce your digital carbon footprint with
            AI-powered insights and actionable recommendations.
          </motion.p>

          <SignedIn>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <p className="text-lg text-gray-200 mb-6">
                {/* Welcome back,{" "}
                <span className="font-semibold bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                  {user?.firstName || user?.username}
                </span> */}
                Welcome back, User
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/dashboard"
                  className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 font-medium"
                >
                  Go to Dashboard
                </Link>
              </motion.div>
            </motion.div>
          </SignedIn>

          <SignedOut>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link
                  to="/sign-in"
                  className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 font-medium"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Link
                  to="/sign-up"
                  className="inline-block border-2 border-emerald-400 text-emerald-400 px-8 py-3 rounded-full hover:bg-emerald-900/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 font-medium"
                >
                  Sign Up
                </Link>
              </motion.div>
            </motion.div>
          </SignedOut>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="inline-flex items-center justify-center gap-4 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-emerald-500/20 shadow-lg"
          >
            <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-300 font-medium">
              Live Carbon Counter:{" "}
              <span className="font-bold">{emission.toFixed(4)} g CO₂</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <CarbonModeToggle />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-2xl text-emerald-300"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 my-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block bg-emerald-900/30 text-emerald-400 px-4 py-1 rounded-full text-sm font-medium mb-4 border border-emerald-400/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            OUR FEATURES
          </motion.span>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Powerful Tools for a{" "}
            <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              Greener Digital Life
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover how CarboVoid helps you understand and reduce your digital
            carbon footprint.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <FaLeaf className="text-4xl" />,
              title: "Carbon Analytics",
              desc: "Real-time tracking of your digital carbon emissions across all activities.",
              link: "/dashboard",
              color: "from-green-500 to-emerald-600",
            },
            {
              icon: <FaMagic className="text-4xl" />,
              title: "AI Suggestions",
              desc: "Personalized recommendations to reduce your footprint without sacrificing productivity.",
              link: "green-suggestions",
              color: "from-purple-500 to-indigo-600",
            },
            {
              icon: <FaDatabase className="text-4xl" />,
              title: "Digital Cleanup",
              desc: "Identify and eliminate digital waste that's silently emitting CO₂.",
              link: "/declutter",
              color: "from-blue-500 to-cyan-600",
            },
            {
              icon: <FaChartLine className="text-4xl" />,
              title: "Ai ChatBot",
              desc: "Chat instantly with our AI to get answers and insights on reducing your carbon footprint.",
              link: "#",
              color: "from-amber-500 to-orange-600",
            },
          ].map(({ icon, title, desc, link, color }, index) => (
            <motion.div
              key={title}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.2 }}
              variants={cardVariants}
              custom={index}
              className="flex"
            >
              <Link
                to={link}
                className={`bg-gradient-to-br ${color} text-white p-8 rounded-2xl shadow-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-col items-center flex-1 min-h-[300px] relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                <motion.div
                  className="mb-6 text-white z-10"
                  variants={iconVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {icon}
                </motion.div>
                <h3 className="text-xl font-bold mb-4 text-center z-10">
                  {title}
                </h3>
                <p className="text-center text-white/90 flex-grow z-10">
                  {desc}
                </p>
                <motion.div
                  className="mt-6 text-white/90 flex items-center gap-2 z-10"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Learn more <FiArrowUp className="transform rotate-45" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Interactive Estimator */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 my-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            className="inline-block bg-emerald-900/30 text-emerald-400 px-4 py-1 rounded-full text-sm font-medium mb-4 border border-emerald-400/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            CARBON CALCULATOR
          </motion.span>
          <motion.h2
            className="text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Estimate Your{" "}
            <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              Digital Emissions
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            See the environmental impact of your digital activities in
            real-time.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl text-white shadow-xl backdrop-blur-sm border border-gray-700"
        >
          <div className="mb-8">
            <label className="block text-lg font-medium text-emerald-300 mb-3">
              Select Digital Activity
            </label>
            <select
              value={activity}
              onChange={(e) => {
                setActivity(e.target.value);
                setInputValue("");
                setCarbonResult(null);
                setAiSuggestion("");
              }}
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="">Choose an activity...</option>
              {Object.keys(activities).map((key) => (
                <option key={key} value={key} className="p-2">
                  {activities[key].icon} {activities[key].label}
                </option>
              ))}
            </select>
          </div>

          {activity && (
            <>
              <div className="mb-8">
                <label className="block text-lg font-medium text-emerald-300 mb-3">
                  {activities[activity].label}
                </label>
                <input
                  type="number"
                  placeholder={activities[activity].placeholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <motion.button
                onClick={estimateCarbon}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all font-bold text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Calculate Carbon Impact
              </motion.button>
            </>
          )}

          {carbonResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-8 p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-emerald-500/20 shadow-lg overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <FiCheckCircle className="text-emerald-400 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Carbon Emission Result
                  </h3>
                  <p className="text-emerald-300">
                    {activities[activity].label}
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400 mb-4">
                {carbonResult} kg CO₂
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-emerald-500">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{activities[activity].icon}</span>
                  <p className="text-gray-200">{aiSuggestion}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Rotating AI Tips Section */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 my-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block bg-emerald-900/30 text-emerald-400 px-4 py-1 rounded-full text-sm font-medium mb-4 border border-emerald-400/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            AI-POWERED INSIGHTS
          </motion.span>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Smart Ways to{" "}
            <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
              Reduce Your Footprint
            </span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Our AI analyzes your habits to provide personalized recommendations.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeTips.map((index, i) => {
            const { text, icon, color } = aiSuggestions[index];
            return (
              <motion.div
                key={i}
                className={`${color} p-8 rounded-2xl shadow-xl min-h-[300px] flex flex-col relative overflow-hidden group`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                viewport={{ once: false, amount: 0.1 }}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
                <motion.div
                  className="text-6xl mb-6 z-10"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ rotate: [0, 10, -10, 0], scale: 1.1 }}
                >
                  {icon}
                </motion.div>
                <motion.p
                  className="text-xl font-medium text-white z-10 flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  {text}
                </motion.p>
                <motion.div
                  className="mt-6 text-white/90 flex items-center gap-2 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <FiStar className="text-yellow-300" /> AI Recommendation
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Enhanced User Reviews Section */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 my-40">
        {/* Section Header with Animated Background */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative"
        >
          {/* Animated floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-emerald-400/20"
              initial={{
                x: Math.random() * 600 - 300,
                y: Math.random() * 100 - 50,
                width: Math.random() * 8 + 2,
                height: Math.random() * 8 + 2,
                opacity: 0,
              }}
              whileInView={{
                opacity: [0.3, 0.8, 0.3],
                y: [0, Math.random() * 40 - 20],
                transition: {
                  duration: Math.random() * 6 + 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                },
              }}
            />
          ))}

          <motion.span
            className="inline-block bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-300 px-6 py-2 rounded-full text-sm font-medium mb-4 border border-emerald-400/30 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            ❤️ USER TESTIMONIALS
          </motion.span>

          <motion.h2
            className="text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Loved by <span className="text-emerald-300">Our Community</span>
          </motion.h2>

          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Hear what our users say about their journey to digital
            sustainability.
          </motion.p>
        </motion.div>

        {/* Review Cards with Staggered Animation */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          {userReviews.map((review, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: "backOut",
                  },
                },
              }}
              whileHover={{
                y: -10,
                boxShadow:
                  "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
              }}
              className="bg-gradient-to-br from-gray-800/70 to-gray-900/80 p-8 rounded-3xl border border-gray-700/50 shadow-xl backdrop-blur-sm transition-all duration-300 group relative overflow-hidden"
            >
              {/* Animated background element */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Review Header */}
              <div className="flex items-center mb-6 relative z-10">
                <motion.div
                  className="text-5xl mr-5"
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.6 },
                  }}
                >
                  {review.avatar}
                </motion.div>
                <div>
                  <h3 className="font-bold text-xl text-white">
                    {review.name}
                  </h3>
                  <p className="text-emerald-300/90 text-sm font-medium">
                    {review.role}
                  </p>
                </div>
              </div>

              {/* Review Content */}
              <motion.p
                className="text-gray-200 mb-8 leading-relaxed relative z-10"
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
              >
                <span className="text-3xl text-emerald-400/30 absolute -left-2 -top-4">
                  "
                </span>
                {review.review}
                <span className="text-3xl text-emerald-400/30 absolute -right-2 -bottom-4">
                  "
                </span>
              </motion.p>

              {/* Rating and Decorative Elements */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className={`text-2xl ${
                        i < review.rating ? "text-yellow-400" : "text-gray-600"
                      }`}
                      whileHover={{
                        scale: 1.3,
                        transition: { type: "spring", stiffness: 500 },
                      }}
                    >
                      {i < review.rating ? "★" : "☆"}
                    </motion.span>
                  ))}
                </div>
                <motion.div
                  className="text-emerald-400/70 text-4xl"
                  animate={{
                    rotate: [0, 5, -5, 0],
                    transition: {
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse",
                    },
                  }}
                >
                  🌿
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Conditional CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <motion.p className="text-xl text-gray-300 mb-8">
            Ready to join our community of eco-conscious users?
          </motion.p>

          <SignedIn>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                to="/features"
                className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 font-medium text-lg"
              >
                Explore Features
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </motion.div>
          </SignedIn>

          <SignedOut>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 font-medium text-lg"
              >
                Get Started Now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </motion.div>
          </SignedOut>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
