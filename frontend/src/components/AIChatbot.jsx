import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const AIChatbot = () => {
    const { user } = useAuth(); // Get user from auth context
    const isAdmin = user?.isAdmin || false; // Check if user is admin

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: isAdmin
                ? 'Hello Admin! 👋 Welcome to your AI Assistant! Ask me about site statistics, orders, customers, or how to manage your shop!'
                : 'Hello! 👋 Welcome to Karur Flower And Bouquet Shop! How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Check dark mode
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        // Watch for theme changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    // Update welcome message when admin status changes
    useEffect(() => {
        if (messages.length === 1 && messages[0].type === 'bot') { // Only update if it's the initial bot message
            setMessages([{
                type: 'bot',
                text: isAdmin
                    ? 'Hello Admin! 👋 Welcome to your AI Assistant! Ask me about site statistics, orders, customers, or how to manage your shop!'
                    : 'Hello! 👋 Welcome to Karur Flower And Bouquet Shop! How can I help you today?',
                timestamp: new Date()
            }]);
        }
    }, [isAdmin]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            type: 'user',
            text: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5000/api/chatbot/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: inputValue,
                    isAdmin: isAdmin // Send admin status to backend
                })
            });

            const data = await response.json();

            setTimeout(() => {
                const botMessage = {
                    type: 'bot',
                    text: data.answer || 'Sorry, I could not process your request. Please try again.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
            }, 1000);
        } catch (error) {
            console.error('Chatbot error:', error);
            setTimeout(() => {
                const errorMessage = {
                    type: 'bot',
                    text: 'Sorry, I\'m having trouble connecting. Please try again later.',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
                setIsTyping(false);
            }, 1000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickQuestions = isAdmin ? [
        "How many visitors viewed the site?",
        "Total orders placed?",
        "Show revenue statistics",
        "How many products do I have?",
        "How to add new products?",
        "Total customers registered?"
    ] : [
        "What flowers do you offer?",
        "What are your shop hours?",
        "Do you deliver flowers?",
        "How can I place an order?",
        "Do you have bouquets for events?",
        "What are your prices?"
    ];

    const handleQuickQuestion = (question) => {
        setInputValue(question);
        setTimeout(() => handleSendMessage(), 100);
    };

    // Dynamic styles based on theme
    const chatWindowBg = isDarkMode
        ? 'linear-gradient(135deg, rgba(30, 30, 40, 0.98) 0%, rgba(50, 30, 60, 0.98) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%)';

    const messagesBg = isDarkMode
        ? 'bg-gradient-to-b from-gray-800/50 to-gray-900/50'
        : 'bg-gradient-to-b from-white/50 to-pink-50/50';

    const botMessageBg = isDarkMode
        ? 'bg-gray-800 text-gray-200 shadow-md border border-purple-500/30'
        : 'bg-white text-gray-800 shadow-md border border-pink-100';

    const inputBg = isDarkMode
        ? 'bg-gray-800/80 backdrop-blur-xl border-t border-purple-500/30'
        : 'bg-white/80 backdrop-blur-xl border-t border-pink-100';

    const textareaBg = isDarkMode
        ? 'bg-gray-700 text-gray-200 border-purple-500/50 focus:border-purple-400 focus:ring-purple-100/20 placeholder-gray-400'
        : 'bg-white text-gray-800 border-pink-200 focus:border-pink-400 focus:ring-pink-100 placeholder-gray-400';

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[90] w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 shadow-2xl flex items-center justify-center cursor-pointer group overflow-hidden"
                style={{
                    boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4), 0 0 64px rgba(236, 72, 153, 0.2)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <AnimatePresence mode="wait">
                    {!isOpen ? (
                        <motion.svg
                            key="chat"
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 180, opacity: 0 }}
                            className="w-8 h-8 text-white relative z-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="close"
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 180, opacity: 0 }}
                            className="w-8 h-8 text-white relative z-10"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                    )}
                </AnimatePresence>

                {/* Pulse Animation */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-purple-600"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 z-[90] w-96 h-[600px] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                        style={{
                            background: chatWindowBg,
                            boxShadow: isDarkMode
                                ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 100px rgba(147, 51, 234, 0.3)'
                                : '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 100px rgba(236, 72, 153, 0.2)'
                        }}
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-5 text-white">
                            <div className="absolute inset-0 bg-black/10" />
                            <div className="relative flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                                        <span className="text-2xl">{isAdmin ? '🎛️' : '🌸'}</span>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{isAdmin ? 'Admin AI Assistant' : 'Floral AI Assistant'}</h3>
                                    <p className="text-xs text-white/80">{isAdmin ? 'Your management companion' : 'Always here to help 24/7'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

                        {/* Messages Container */}
                        <div className={`h-[400px] overflow-y-auto p-4 space-y-4 ${messagesBg}`}>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.type === 'user'
                                            ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg'
                                            : botMessageBg
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                                        <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className={`rounded-2xl px-4 py-3 ${botMessageBg}`}>
                                        <div className="flex space-x-2">
                                            <motion.div
                                                className="w-2 h-2 bg-pink-400 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-rose-400 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                            />
                                            <motion.div
                                                className="w-2 h-2 bg-purple-400 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Quick Questions (shown when no messages from user) */}
                            {messages.length === 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="space-y-2"
                                >
                                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>💡 Quick questions:</p>
                                    {quickQuestions.slice(0, 3).map((question, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleQuickQuestion(question)}
                                            className={`w-full text-left text-sm rounded-xl px-4 py-2 shadow-sm transition-all duration-200 ${isDarkMode
                                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-purple-500/30'
                                                : 'bg-white hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 text-gray-700 border border-pink-100'
                                                }`}
                                        >
                                            {question}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className={`absolute bottom-0 left-0 right-0 p-4 ${inputBg}`}>
                            <div className="flex items-end space-x-2">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything about our shop..."
                                        rows="1"
                                        className={`w-full px-4 py-3 pr-12 rounded-xl border-2 outline-none resize-none transition-all duration-200 ${textareaBg}`}
                                        style={{
                                            maxHeight: '100px',
                                            minHeight: '48px'
                                        }}
                                    />
                                    <div className={`absolute right-2 bottom-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Press Enter
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};

export default AIChatbot;
