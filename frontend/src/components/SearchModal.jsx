import React, { useState, useEffect } from "react";
import { FiX, FiSearch, FiShoppingCart } from "react-icons/fi";
import axios from "../api/axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
        if (!isAuthenticated) {
            toast.error("Please login to add to cart");
            onClose();
            navigate("/login", { state: { from: location.pathname } });
            return;
        }
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
            <div className="w-full max-w-3xl bg-white dark:bg-[#261B22] border border-[#E8DDD5] dark:border-[#493640] rounded-2xl shadow-2xl overflow-hidden mx-4 animate-fadeInDown transition-colors duration-300">

                {/* Header */}
                <div className="flex items-center border-b border-[#E8DDD5] dark:border-[#493640] p-4 gap-4">
                    <FiSearch className="text-[#651F3C] dark:text-[#D5B36C] w-6 h-6" />
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search for bouquets, stage decor, bridal jadai..."
                        className="flex-1 text-lg outline-none text-[#30232A] dark:text-[#FAF5EE] placeholder-[#81747A] dark:placeholder-[#8E7A83] bg-transparent"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoComplete="off"
                    />
                    <button onClick={onClose} className="p-2 hover:bg-[#F6ECE7] dark:hover:bg-[#30232A] rounded-full transition">
                        <FiX className="w-6 h-6 text-[#81747A] dark:text-[#8E7A83]" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar bg-[#FAF5EE] dark:bg-[#160F17]">
                    {loading ? (
                        <div className="text-center py-10 opacity-50 dark:text-[#8E7A83]">Searching...</div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {results.map(product => (
                                <div key={product._id} className="bg-white dark:bg-[#231722] p-3 rounded-xl shadow-sm hover:shadow-md transition flex gap-4 border border-[#E8DDD5] dark:border-[#493640] hover:border-[#C5A15B] group">
                                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg bg-[#F6ECE7]" />
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-[#30232A] dark:text-[#FAF5EF] line-clamp-1 group-hover:text-[#651F3C] transition">{product.name}</h4>
                                            <p className="text-[#651F3C] dark:text-[#D5B36C] font-bold text-sm">₹{product.price}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <Link to={`/product/${product._id}`} onClick={onClose} className="text-xs text-[#81747A] dark:text-[#8E7A83] hover:text-[#651F3C] underline">View Details</Link>
                                            <button onClick={() => handleAddToCart(product)} className="p-2 bg-[#F5EAE9] dark:bg-[#30232A] text-[#651F3C] dark:text-[#D5B36C] rounded-full hover:bg-[#651F3C] hover:text-white transition shadow-sm">
                                                <FiShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="text-center py-10 opacity-50 dark:text-[#8E7A83]">No products found.</div>
                    ) : (
                        <div className="text-center py-10 opacity-40 text-sm dark:text-[#8E7A83]">
                            Start typing to search products...
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SearchModal;
