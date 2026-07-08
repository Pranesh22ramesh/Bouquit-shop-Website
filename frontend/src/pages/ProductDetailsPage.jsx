import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { galleryService } from "../api/galleryService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { userService } from "../api/userService";
import ProductReviewPanel from "../components/ProductReviewPanel";
import { hexToColorName } from "../utils/colorUtils";

const PriceINR = ({ amount }) => <span className="font-semibold">₹{Number(amount || 0).toLocaleString("en-IN")}</span>;

const defaultCustomization = {
  mainColor: "#ff0000",
  secondaryColor: "#ffffff",
  stones: false,
  beads: false,
  quantity: 1,
  referenceName: "",
  referencePreview: "",
  notes: "",
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [custom, setCustom] = useState(defaultCustomization);
  const [whatsappPopupUrl, setWhatsappPopupUrl] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [contactInfo, setContactInfo] = useState({ phone: user?.phone || "", address: user?.address || "" });

  useEffect(() => {
    if (user) {
      setContactInfo({ phone: user.phone || "", address: user.address || "" });
    }
  }, [user]);

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDarkMode(document.documentElement.classList.contains("dark")));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await galleryService.getById(id);
        setProduct(data);
        setCustom(defaultCustomization);
      } catch (err) {
        toast.error("Product not found");
        navigate("/gallery");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const basePrice = product?.offerPrice && product?.badge === "Offer" ? product.offerPrice : product?.price || 0;
  const extrasPrice = (custom.stones ? 200 : 0) + (custom.beads ? 120 : 0);
  const totalPrice = (basePrice + extrasPrice) * custom.quantity;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    if (!product) return;
    try {
      addItem({
        productId: product._id,
        quantity: custom.quantity,
        customization: {
          mainColor: custom.mainColor,
          secondaryColor: custom.secondaryColor,
          stones: custom.stones,
          beads: custom.beads,
          notes: custom.notes,
          referencePreview: custom.referencePreview
        }
      });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add to cart");
    }
  };

  const handleReference = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setCustom((current) => ({ ...current, referenceName: file.name, referencePreview: event.target?.result || "" }));
    reader.readAsDataURL(file);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Please login to order products");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }
    if (!contactInfo.phone || !contactInfo.address) {
       setShowAddressModal(true);
       return;
    }
    proceedToWhatsApp(contactInfo.phone, contactInfo.address);
  };

  const proceedToWhatsApp = async (phone, address) => {
    if (!product) return;
    
    // Attempt to update profile if logged in but missing these details
    if (user && (!user.phone || !user.address)) {
      try {
        await userService.updateProfile({ phone, address });
        if (updateUser) updateUser({ phone, address });
      } catch (e) {
        console.error("Failed to update profile", e);
      }
    }

    const color1 = hexToColorName(custom.mainColor);
    const color2 = hexToColorName(custom.secondaryColor);

    let message = `Hello! I would like to place an order.\n\n*Product:* ${product.name}\n*Total Price:* ₹${totalPrice}\n`;
    message += `*Quantity:* ${custom.quantity}\n*Colours:* ${color1} / ${color2}\n`;
    if (custom.stones) message += "+ Stones\n";
    if (custom.beads) message += "+ Beads\n";
    if (custom.notes) message += `*Note:* ${custom.notes}\n`;
    if (user) message += `\n*Customer:* ${user.name}\n*Email:* ${user.email}\n`;
    message += `*Phone:* ${phone}\n*Delivery Address:* ${address}\n`;
    if (product.image) message += `\n*Product Image:* ${product.image.startsWith("http") ? product.image : window.location.origin + product.image}`;
    
    setWhatsappPopupUrl(`https://wa.me/919942071721?text=${encodeURIComponent(message)}`);
    setShowAddressModal(false);
  };

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center"><div className="animate-spin h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full"></div></div>;
  }

  if (!product) return null;

  return (
    <div className={`min-h-screen pt-24 pb-12 transition-colors ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#fff9f7] text-gray-900"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm font-medium text-gray-500 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-rose-600 transition">Home</button>
          <span className="mx-2">/</span>
          <button onClick={() => navigate("/gallery")} className="hover:text-rose-600 transition">Gallery</button>
          <span className="mx-2">/</span>
          <span className={isDarkMode ? "text-gray-300" : "text-gray-900"}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: Image Viewer */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white aspect-[4/5] group">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
            ) : (
              <div className="w-full h-full grid place-items-center bg-gray-100 text-gray-400">No Image Available</div>
            )}
            {product.badge && product.badge !== "Normal" && (
              <span className={`absolute top-4 left-4 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md ${product.badge === "Offer" ? "bg-rose-600" : "bg-emerald-600"}`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <span className={`inline-block w-fit rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest ${isDarkMode ? "bg-rose-500/20 text-rose-300" : "bg-rose-100 text-rose-700"}`}>
              {product.category}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">{product.name}</h1>
            
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center text-yellow-500">
                <span className="text-lg">★</span>
                <span className="ml-1 text-sm font-bold">{product.analytics?.averageRating || "0.0"}</span>
              </div>
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                ({product.analytics?.reviewCount || 0} reviews)
              </span>
            </div>

            <p className={`mt-6 text-base leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {product.description || "No description provided."}
            </p>

            <div className="mt-8 flex items-baseline gap-4">
              <span className="text-4xl font-black text-rose-600">
                <PriceINR amount={basePrice} />
              </span>
              {product.offerPrice && product.badge === "Offer" && (
                <span className="text-xl font-medium text-gray-500 line-through">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Customizations */}
            <div className={`mt-8 rounded-2xl border p-6 shadow-sm ${isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-100 bg-white"}`}>
              <h3 className="text-lg font-bold mb-4">Personalize Your Order</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                {[["mainColor", "Primary Color"], ["secondaryColor", "Secondary Color"]].map(([field, label]) => (
                  <label key={field} className="text-sm font-semibold flex flex-col gap-2">
                    {label}
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={custom[field]} 
                        onChange={(e) => setCustom(c => ({ ...c, [field]: e.target.value }))} 
                        className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0" 
                      />
                      <span className={`font-mono text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{custom[field]}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[["stones", "Add Stones", 200], ["beads", "Add Beads", 120]].map(([field, label, price]) => (
                  <button 
                    key={field} 
                    onClick={() => setCustom(c => ({ ...c, [field]: !c[field] }))} 
                    className={`rounded-xl border-2 p-3 text-left transition-all ${custom[field] ? "border-rose-500 bg-rose-50 text-rose-800" : isDarkMode ? "border-gray-600 text-gray-300 hover:border-gray-500" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                  >
                    <span className="block font-semibold text-sm">{label}</span>
                    <span className={`block text-xs mt-1 ${custom[field] ? "text-rose-600" : "text-green-600"}`}>+₹{price}</span>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${isDarkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}>
                  <span className="text-2xl mb-2">📸</span>
                  <span className="text-sm font-medium">{custom.referenceName || "Upload Reference Photo (Optional)"}</span>
                  <span className="text-xs text-gray-500 mt-1">Share an inspiration image with us</span>
                  <input type="file" accept="image/*" onChange={(e) => handleReference(e.target.files?.[0])} className="hidden" />
                </label>
              </div>

              <textarea 
                value={custom.notes} 
                onChange={(e) => setCustom(c => ({ ...c, notes: e.target.value }))} 
                rows={3} 
                placeholder="Any special requests or notes..." 
                className={`w-full resize-none rounded-xl border p-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-rose-500/20 ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-200 bg-gray-50"}`} 
              />
            </div>

            {/* Checkout Area */}
            <div className={`mt-8 sticky bottom-4 z-40 rounded-2xl border p-4 shadow-xl backdrop-blur-xl ${isDarkMode ? "border-gray-700 bg-gray-800/90" : "border-rose-100 bg-white/90"}`}>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className={`flex items-center justify-between overflow-hidden rounded-xl border w-full sm:w-32 h-12 ${isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"}`}>
                  <button onClick={() => setCustom(c => ({ ...c, quantity: Math.max(1, c.quantity - 1) }))} className="px-4 py-2 hover:bg-black/5 transition">−</button>
                  <span className="font-bold">{custom.quantity}</span>
                  <button onClick={() => setCustom(c => ({ ...c, quantity: c.quantity + 1 }))} className="px-4 py-2 hover:bg-black/5 transition">+</button>
                </div>
                
                <div className="flex w-full gap-3">
                  <button onClick={handleAddToCart} className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 h-12 font-bold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 transition-all">
                    Add to Cart • ₹{totalPrice.toLocaleString("en-IN")}
                  </button>
                  <button onClick={handleBuyNow} className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 h-12 font-bold text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all">
                    WhatsApp Buy
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <ProductReviewPanel product={product} isDarkMode={isDarkMode} onReviewChange={() => {}} />
        </div>
      </div>

      {whatsappPopupUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setWhatsappPopupUrl(null)}>
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md rounded-3xl p-8 text-center shadow-2xl transform scale-100 animate-scaleIn ${isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-green-100 text-4xl text-green-600">✓</div>
            <h3 className="text-2xl font-black">Almost there!</h3>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">Continue to WhatsApp to share your requirements and place the order. We will respond promptly!</p>
            <div className="mt-8 flex justify-center gap-4">
              <button onClick={() => setWhatsappPopupUrl(null)} className="flex-1 rounded-xl bg-gray-100 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-200 transition">Cancel</button>
              <button onClick={() => { window.open(whatsappPopupUrl, "_blank"); setWhatsappPopupUrl(null); }} className="flex-1 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white shadow-lg shadow-green-600/30 hover:bg-green-700 transition">Open WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowAddressModal(false)}>
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md rounded-3xl p-8 shadow-2xl transform scale-100 animate-scaleIn ${isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"}`}>
            <h3 className="text-2xl font-black mb-2">Delivery Details</h3>
            <p className="text-sm text-gray-500 mb-6">Please provide your contact information to proceed with the WhatsApp order.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  className={`w-full rounded-xl border p-3 outline-none ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-200 bg-gray-50"}`}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Delivery Address</label>
                <textarea 
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                  rows={3}
                  className={`w-full rounded-xl border p-3 outline-none resize-none ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-200 bg-gray-50"}`}
                  placeholder="Enter your complete delivery address"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowAddressModal(false)} className="rounded-xl px-5 py-2.5 font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
              <button onClick={() => proceedToWhatsApp(contactInfo.phone, contactInfo.address)} className="rounded-xl bg-rose-600 px-6 py-2.5 font-bold text-white hover:bg-rose-700 transition disabled:opacity-50" disabled={!contactInfo.phone || !contactInfo.address}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
