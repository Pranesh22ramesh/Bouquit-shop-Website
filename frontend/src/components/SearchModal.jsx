import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiShoppingCart } from "react-icons/fi";
import axios from "../api/axios";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-hot-toast";

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setTimeout(() => {
                const input = document.getElementById("search-input");
                if (input) input.focus();
            }, 100);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                try {
                    const res = await axios.get(`/products?keyword=${query}`);
                    setResults(res.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleAddToCart = (product) => {
        addItem({
            ...product,
            customization: {
                mainColor: "Red",
                quantity: 1
            }
        });
        toast.success(`Added ${product.name} to cart`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mx-4 animate-fadeInDown transition-colors duration-300">

                {/* Header */}
                <div className="flex items-center border-b dark:border-gray-700 p-4 gap-4">
                    <FiSearch className="text-gray-400 w-6 h-6" />
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search for bouquets, stage decor..."
                        className="flex-1 text-lg outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 bg-transparent"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoComplete="off"
                    />
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
                        <FiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar bg-gray-50 dark:bg-gray-900">
                    {loading ? (
                        <div className="text-center py-10 opacity-50 dark:text-gray-400">Searching...</div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {results.map(product => (
                                <div key={product._id} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm hover:shadow-md transition flex gap-4 border border-transparent hover:border-rose-100 dark:hover:border-rose-900 group">
                                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-rose-600 transition">{product.name}</h4>
                                            <p className="text-rose-600 dark:text-rose-400 font-bold text-sm">₹{product.price}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <Link to="/gallery" onClick={onClose} className="text-xs text-gray-500 dark:text-gray-400 hover:text-rose-500 underline">View in Gallery</Link>
                                            <button onClick={() => handleAddToCart(product)} className="p-2 bg-rose-50 dark:bg-gray-700 text-rose-600 dark:text-rose-300 rounded-full hover:bg-rose-100 dark:hover:bg-rose-600 dark:hover:text-white transition shadow-sm">
                                                <FiShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="text-center py-10 opacity-50 dark:text-gray-400">No products found.</div>
                    ) : (
                        <div className="text-center py-10 opacity-40 text-sm dark:text-gray-500">
                            Start typing to search products...
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SearchModal;
