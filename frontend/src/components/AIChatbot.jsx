import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getBotResponse, SHOP_INFO } from '../utils/chatbotBrain';

const AIChatbot = () => {
    const { user, isAuthenticated } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    const isAdmin = user?.isAdmin || user?.role === 'ADMIN' || false;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: isAdmin
                ? 'Hello Admin! 👋 Welcome to your Floral Management AI! Ask me about statistics, orders, or managing store products.'
                : 'Vanakkam & Hello! 🌸 Welcome to **MIDHUNYAS Petals & Bridal Flowers**!\n\nTell me what you are looking for, or share your **taste, occasion, or budget**, and I will suggest the best flower designs for you! ✨',
            suggestions: [
                '🌸 South Indian Bridal Jadai',
                '💐 Birthday & Anniversary Bouquets',
                '🏛️ Stage & Mandap Decor',
                '🎨 Custom Flower Orders',
                '🚚 Delivery in Karur & Tamil Nadu'
            ],
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [addedCartId, setAddedCartId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
        return () => observer.disconnect();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleAddToCart = async (product) => {
        if (!isAuthenticated) {
            alert('Please log in to add items to your cart.');
            navigate('/login');
            return;
        }

        try {
            await addItem({
                productId: product.id,
                quantity: 1,
                price: product.offerPrice || product.price,
                customization: {}
            });
            setAddedCartId(product.id);
            setTimeout(() => setAddedCartId(null), 2500);
        } catch (err) {
            console.error('Failed to add to cart:', err);
        }
    };

    const handleSendMessage = async (textToSend) => {
        const text = (textToSend || inputValue).trim();
        if (!text) return;

        const userMessage = {
            type: 'user',
            text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Process query with intelligent floral stylist engine
        setTimeout(() => {
            try {
                const responseData = getBotResponse(text);
                const botMessage = {
                    type: 'bot',
                    text: responseData.text,
                    products: responseData.products || null,
                    action: responseData.action || null,
                    suggestions: responseData.suggestions || null,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
            } catch (err) {
                console.error('Bot processing error:', err);
                setMessages(prev => [
                    ...prev,
                    {
                        type: 'bot',
                        text: 'I am here to help you select the best flowers for your event! 🌸 You can also connect with us on WhatsApp at +91 9942071721 for immediate assistance.',
                        action: {
                            type: 'whatsapp',
                            label: '💬 Connect on WhatsApp',
                            url: 'https://wa.me/919942071721'
                        },
                        timestamp: new Date()
                    }
                ]);
            } finally {
                setIsTyping(false);
            }
        }, 600);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const chatWindowBg = isDarkMode
        ? 'linear-gradient(135deg, rgba(20, 20, 30, 0.98) 0%, rgba(45, 20, 50, 0.98) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 245, 248, 0.98) 100%)';

    const messagesBg = isDarkMode
        ? 'bg-gradient-to-b from-gray-900/90 to-gray-950/90'
        : 'bg-gradient-to-b from-pink-50/40 to-rose-50/30';

    const botMessageBg = isDarkMode
        ? 'bg-gray-800 text-gray-100 shadow-md border border-purple-500/30'
        : 'bg-white text-gray-800 shadow-md border border-pink-100';

    return (
        <>
            {/* Floating Chat Trigger Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open AI Floral Assistant"
                className="fixed bottom-6 right-6 z-[90] w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 shadow-2xl flex items-center justify-center cursor-pointer group"
                style={{
                    boxShadow: '0 8px 32px rgba(236, 72, 153, 0.45), 0 0 64px rgba(236, 72, 153, 0.25)'
                }}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <AnimatePresence mode="wait">
                    {!isOpen ? (
                        <motion.div
                            key="open-icon"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            className="flex flex-col items-center justify-center text-white"
                        >
                            <span className="text-2xl">🌸</span>
                        </motion.div>
                    ) : (
                        <motion.svg
                            key="close-icon"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            className="w-7 h-7 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </motion.svg>
                    )}
                </AnimatePresence>

                {/* Subtle Pulse Rings */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-pink-500/30"
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
            </motion.button>

            {/* Chatbot Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.92 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-4 sm:right-6 z-[90] w-[94vw] sm:w-[420px] h-[620px] max-h-[82vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-200/50 dark:border-purple-500/30"
                        style={{
                            background: chatWindowBg,
                            boxShadow: isDarkMode
                                ? '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 80px rgba(168, 85, 247, 0.25)'
                                : '0 20px 60px rgba(236, 72, 153, 0.25), 0 0 80px rgba(244, 114, 182, 0.2)'
                        }}
                    >
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-5 py-4 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/50 shadow-inner">
                                        <span className="text-xl">🌸</span>
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base tracking-wide flex items-center gap-1.5">
                                        Floral Stylist AI
                                        <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-medium">Smart</span>
                                    </h3>
                                    <p className="text-xs text-white/85">MIDHUNYAS Petals • Karur</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
                                aria-label="Minimize Chat"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Scroll Area */}
                        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${messagesBg}`}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    {/* Text Bubble */}
                                    <div
                                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                            msg.type === 'user'
                                                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md rounded-br-none'
                                                : `${botMessageBg} rounded-tl-none`
                                        }`}
                                    >
                                        <p className="whitespace-pre-line font-normal">{msg.text}</p>
                                        <span
                                            className={`block text-[10px] mt-1.5 text-right ${
                                                msg.type === 'user' ? 'text-white/70' : isDarkMode ? 'text-gray-400' : 'text-gray-400'
                                            }`}
                                        >
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    {/* Product Recommendation Cards Carousel/List */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="w-full mt-2.5 space-y-2">
                                            <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider pl-1">
                                                🌸 Recommended for Your Taste:
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {msg.products.map((prod) => (
                                                    <div
                                                        key={prod.id}
                                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-pink-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                                                    >
                                                        <img
                                                            src={prod.image}
                                                            alt={prod.name}
                                                            className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                                                            onError={(e) => {
                                                                e.target.src = 'https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=400';
                                                            }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">
                                                                {prod.name}
                                                            </h4>
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                                                {prod.description}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                                                                    ₹{prod.offerPrice || prod.price}
                                                                </span>
                                                                {prod.offerPrice && (
                                                                    <span className="text-[10px] text-gray-400 line-through">
                                                                        ₹{prod.price}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => handleAddToCart(prod)}
                                                                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                                                                    addedCartId === prod.id
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-pink-600 hover:bg-pink-700 text-white'
                                                                }`}
                                                            >
                                                                {addedCartId === prod.id ? '✓ Added' : '+ Cart'}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setIsOpen(false);
                                                                    navigate('/gallery');
                                                                }}
                                                                className="px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-300 hover:text-pink-600 underline"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button (WhatsApp, etc.) */}
                                    {msg.action && (
                                        <a
                                            href={msg.action.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-transform hover:scale-102"
                                        >
                                            {msg.action.label}
                                        </a>
                                    )}

                                    {/* Suggestion Chips */}
                                    {msg.suggestions && (
                                        <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                                            {msg.suggestions.map((sug, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(sug)}
                                                    className="text-xs px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-800 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-purple-600/40 hover:bg-pink-50 dark:hover:bg-gray-700 shadow-xs transition-all cursor-pointer font-medium"
                                                >
                                                    {sug}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-pink-100 dark:border-purple-500/20 w-fit shadow-xs"
                                >
                                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    <span className="text-[11px] text-gray-400 ml-1.5">Analyzing taste...</span>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white/90 dark:bg-gray-900/90 border-t border-pink-100 dark:border-gray-800 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your event, flower taste, or budget..."
                                    rows="1"
                                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 dark:border-gray-700 bg-pink-50/30 dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-pink-500 dark:focus:border-purple-400 focus:ring-1 focus:ring-pink-300 resize-none transition-all placeholder-gray-400"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSendMessage()}
                                    disabled={!inputValue.trim()}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-opacity"
                                    aria-label="Send message"
                                >
                                    <svg className="w-4 h-4 transform rotate-45 -translate-y-0.5 -translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </motion.button>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 px-1">
                                <span>Press Enter to send</span>
                                <a
                                    href={`https://wa.me/91${SHOP_INFO.whatsapp}?text=Hi%20MIDHUNYAS,%20I%20have%20a%20question%20about%20flowers.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
                                >
                                    <span>Instant WhatsApp</span>
                                    <span>↗</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
