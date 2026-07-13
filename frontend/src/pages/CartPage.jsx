// src/pages/CartPage.jsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../api/userService";
import { hexToColorName } from "../utils/colorUtils";
import { toast } from "react-hot-toast";

const PriceINR = ({ amount }) => (
  <span className="font-semibold">₹{amount?.toLocaleString("en-IN") || 0}</span>
);

const CartPage = () => {
  const { items, updateQty, removeItem, subtotal, tax, delivery, grandTotal } = useCart();
  const navigate = useNavigate();

  const [editingItem, setEditingItem] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [whatsappPopupUrl, setWhatsappPopupUrl] = useState(null);
  
  const { user, updateUser, isAuthenticated } = useAuth();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [contactInfo, setContactInfo] = useState({ phone: user?.phone || "", address: user?.address || "" });

  React.useEffect(() => {
    if (user) {
      setContactInfo({ phone: user.phone || "", address: user.address || "" });
    }
  }, [user]);

  const handleQtyChange = (id, newQty) => {
    // id could be cartId (local) or _id (backend)
    if (newQty < 1) return;
    updateQty(id, newQty);
  };

  const handleEditNote = (item) => {
    setEditingItem(item);
    setEditNote(item.customization?.notes || "");
  };

  const saveNote = () => {
    // For now, CartContext updateQty doesn't support updating notes separately easily in API unless we expand it.
    // But typically quantity is the main thing.
    // If we want to support updating notes, we need `updateCartItem` in context to accept customization updates.
    // For this step, let's just focus on Quantity + Remove as that's core.
    // If user wants to change customization, they usually remove and re-add.
    setEditingItem(null);
  };

  const handleWhatsAppOrder = () => {
    if (!isAuthenticated) {
      toast.error("Please login to order products");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (!contactInfo.phone || !contactInfo.address) {
       setShowAddressModal(true);
       return;
    }
    proceedToWhatsApp(contactInfo.phone, contactInfo.address);
  };

  const proceedToWhatsApp = async (phone, address) => {
    if (user && (!user.phone || !user.address)) {
      try {
        await userService.updateProfile({ phone, address });
        if (updateUser) updateUser({ phone, address });
      } catch (e) {
        console.error("Failed to update profile", e);
      }
    }

    const phoneNumber = "919942071721";
    let message = `Hello! I would like to place an order for the following items:\n\n`;

    items.forEach((item, index) => {
      const product = item.productId && typeof item.productId === 'object' ? item.productId : item;
      const name = product.name || product.title || "Product";
      const price = product.price || product.unitPrice || 0;
      message += `${index + 1}. *${name}* - ₹${price} x ${item.quantity}\n`;
      if (item.customization) {
        if (item.customization.mainColor) {
          const c1 = hexToColorName(item.customization.mainColor);
          const c2 = item.customization.secondaryColor ? hexToColorName(item.customization.secondaryColor) : "None";
          message += `   Color: ${c1}/${c2}\n`;
        }
        if (item.customization.stones) message += `   + Stones\n`;
        if (item.customization.beads) message += `   + Beads\n`;
        if (item.customization.notes) message += `   Note: ${item.customization.notes}\n`;
        if (item.customization.referencePreview) message += `   (⚠️ Has Reference Photo - Will send separately)\n`;
      }
      const imageUrl = product.image || product.src || product.thumbnail;
      if (imageUrl) {
        const absoluteImageUrl = imageUrl.startsWith("http") ? imageUrl : window.location.origin + imageUrl;
        message += `   Product Image: ${absoluteImageUrl}\n`;
      }
      message += `\n`;
    });

    message += `--------------------------\n`;
    message += `*Total Amount:* ₹${grandTotal}\n`;

    if (user) {
      message += `\n*Customer Details:* \nName: ${user.name}\nEmail: ${user.email}\n`;
    }
    message += `Phone: ${phone}\nDelivery Address: ${address}\n`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    setWhatsappPopupUrl(url);
    setShowAddressModal(false);
  };

  const [isDarkMode] = React.useState(() => document.documentElement.classList.contains("dark"));

  if (!items || items.length === 0) {
    return (
      <div className={`min-h-[60vh] flex flex-col items-center justify-center text-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#fff7f3] text-rose-900"}`}>
        <h1 className="text-2xl font-bold mb-3">Your Cart is Empty</h1>
        <p className={`mb-6 ${isDarkMode ? "text-gray-400" : "text-rose-600"}`}>Looks like you haven&apos;t added any floral designs yet.</p>
        <Link to="/gallery" className="px-6 py-2 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition">
          Browse Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#fff7f3]"}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? "text-white" : "text-rose-900"}`}>Your Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              // Normalize item data (Hybrid: Backend 'productId' is object, Local is id string)
              const product = item.productId && typeof item.productId === 'object' ? item.productId : item;
              const name = product.name || product.title || "Product";
              const image = product.image || product.src || "";
              const price = product.price || product.unitPrice || 0;

              // ID for actions
              // If backend item, it has `_id`. BUT `updateQty` expects the cart item ID?
              // No, my CartContext `updateQty` sends `{ itemId: cartId, ... }`.
              // If backend, `item._id` is the unique ID of the line item? 
              // Verify CartContext logic later. Assuming `item._id` or `item.cartId` works.
              const actionId = item._id || item.cartId;

              return (
                <div key={actionId} className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border shadow-sm ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-rose-100"}`}>
                  <div className="w-full sm:w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-800"}`}>{name}</h3>
                    <div className="text-sm opacity-80 mt-1 space-y-1">
                      {item.customization?.mainColor && <p>Color: {item.customization.mainColor} / {item.customization.secondaryColor}</p>}
                      {item.customization?.stones && <span>• With Stones </span>}
                      {item.customization?.beads && <span>• With Beads</span>}
                    </div>
                    {item.customization?.notes && (
                      <p className="text-xs italic mt-2 opacity-70">"{item.customization.notes}"</p>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col justify-between items-end sm:gap-4">
                    <div className="text-right">
                      <p className="text-sm opacity-60">Price</p>
                      <PriceINR amount={price} />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex items-center rounded-lg border ${isDarkMode ? "border-gray-600" : "border-rose-200"}`}>
                        <button onClick={() => handleQtyChange(actionId, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100/10">-</button>
                        <span className="px-2 font-medium">{item.quantity}</span>
                        <button onClick={() => handleQtyChange(actionId, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100/10">+</button>
                      </div>
                      <button onClick={() => removeItem(actionId)} className="text-red-500 hover:text-red-600 p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className={`rounded-2xl p-6 shadow-lg sticky top-24 border ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-rose-100"}`}>
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm border-b pb-4 opacity-80 border-gray-200/20">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <PriceINR amount={subtotal} />
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <PriceINR amount={tax} />
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <PriceINR amount={delivery} />
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4">
                <span>Grand Total</span>
                <PriceINR amount={grandTotal} />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button onClick={handleWhatsAppOrder} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Order via WhatsApp
                </button>
                <button onClick={() => navigate('/checkout')} className="w-full bg-white border-2 border-rose-100 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-50 hover:border-rose-200 transition-transform">
                  Proceed to Standard Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* WhatsApp Confirmation Popup */}
      {whatsappPopupUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setWhatsappPopupUrl(null)}>
          <div 
            className={`rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-scaleIn ${isDarkMode ? "bg-gray-800 border border-gray-700 text-gray-100" : "bg-white text-gray-800"}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Almost there!</h3>
            <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Once done placing and sending the order in WhatsApp, please verify and confirm your order by calling this number: <br/>
              <span className="font-bold text-lg text-rose-600 mt-2 block">+91 9942071721</span>
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setWhatsappPopupUrl(null)} 
                className={`px-5 py-2.5 rounded-xl font-medium ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  window.open(whatsappPopupUrl, '_blank');
                  setWhatsappPopupUrl(null);
                }} 
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg"
              >
                Proceed to WhatsApp
              </button>
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

export default CartPage;