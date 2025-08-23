import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", message: "" });
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [animatePaper, setAnimatePaper] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      alert("Please fill out all fields.");
      return;
    }
    setSending(true);
    setAnimatePaper(true);

    const payload = {
      to: formData.email,
      subject: "Contact Form Submission",
      message: formData.message,
    };

    try {
      const response = await axios.post("http://localhost:5000/send-email", payload);
      console.log(response.data);

      setTimeout(() => {
        setSent(true);
        setAnimatePaper(false);
        setTimeout(() => navigate("/"), 2000);
      }, 1500);
    } catch (error) {
      console.error("Email sending error:", error);
      alert("Failed to send message. Please try again.");
      setSending(false);
      setAnimatePaper(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-black relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onMouseEnter={() => setShowForm(true)}
    >
      {/* Optional background glow animation */}
      <motion.div className="absolute inset-0 bg-green-400/10 blur-3xl animate-pulse" />

      <motion.h2
        className="text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg border-b-4 border-green-500 pb-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        Contact <span className="text-green-400">CarboVoid</span>
      </motion.h2>

      {!showForm && (
        <motion.button
          onClick={() => setShowForm(true)}
          className="mt-4 px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          Get in Touch
        </motion.button>
      )}

      {(showForm && !sent) && (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-green-500 mt-6"
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div className="mb-6" whileHover={{ scale: 1.05 }}>
            <label className="block text-white font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-700 rounded-lg bg-black text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            />
          </motion.div>

          <motion.div className="mb-6" whileHover={{ scale: 1.05 }}>
            <label className="block text-white font-medium mb-2">Message</label>
            <textarea
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message..."
              className="w-full p-3 border border-gray-700 rounded-lg bg-black text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-300 hover:bg-green-600"
              disabled={sending}
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </motion.div>
        </motion.form>
      )}

      {sent && (
        <motion.div
          className="mt-6 p-4 bg-green-400 text-black rounded-lg shadow-lg"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.5, rotateX: 180, y: -100 }}
          transition={{ duration: 1.5 }}
        >
          <p className="font-bold">Message Sent!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Contact;
