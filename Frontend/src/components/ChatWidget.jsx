import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Leaf } from 'lucide-react';
import { sendMessageToGreenBot } from '../services/chat';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! I\'m GreenBot 🌱\nAsk me about reducing your digital carbon footprint!' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const botReply = await sendMessageToGreenBot(input);
    setMessages((prev) => [
      ...prev,
      { sender: 'bot', text: botReply || "I'm still learning about sustainability. Could you rephrase that?" },
    ]);
    setIsTyping(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className={`relative bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
            isOpen ? 'rotate-90' : 'rotate-0'
          }`}
          style={{
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          {isOpen ? (
            <X size={20} className="transition-transform duration-200" />
          ) : (
            <>
              <MessageSquare size={20} className="transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 bg-emerald-400 text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                <Leaf size={10} />
              </span>
            </>
          )}
        </button>
      </div>

      {/* Chat Container */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-xl flex flex-col border border-gray-200 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-white bg-opacity-20 p-1 rounded-full">
                <Leaf size={16} />
              </div>
              <h3 className="font-semibold text-sm">GreenBot Assistant</h3>
            </div>
            <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
              {isTyping ? 'Typing...' : 'Online'}
            </div>
          </div>

          {/* Chat messages */}
          <div
            ref={chatRef}
            className="flex-1 p-3 h-64 overflow-y-auto bg-gradient-to-b from-emerald-50/50 to-white"
          >
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-line ${
                      msg.sender === 'bot'
                        ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 px-3 py-2 rounded-lg shadow-sm border border-gray-100 flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input area */}
          <form 
            onSubmit={handleSubmit} 
            className="border-t border-gray-200 p-3 bg-white rounded-b-xl"
          >
            <div className="flex items-center space-x-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                placeholder="Type your question..."
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`p-2 rounded-lg ${
                  input.trim()
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm hover:shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } transition-all`}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatWidget;