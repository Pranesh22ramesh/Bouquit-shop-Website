// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import axios from "../api/axios";
import { hexToColorName } from "../utils/colorUtils";
import { toast } from "react-hot-toast";

const toAbsoluteImageUrl = (image) => {
  if (!image || typeof window === "undefined") return "";

  try {
    return new URL(image, window.location.origin).href;
  } catch {
    return image;
  }
};

const CheckoutPage = () => {
  const { items, subtotal, tax, delivery, grandTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);

  // WhatsApp Popup State
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
    } else if (user) {
      if (user.address && !shipping.address) {
        setShipping((prev) => ({ ...prev, address: user.address }));
      }
    }
  }, [isAuthenticated, user, navigate, shipping.address]);

  if (items.length === 0 && !showWhatsAppPopup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF5EF]">
        <h2 className="text-2xl font-serif font-bold text-[#651F3C] mb-4">Your cart is empty</h2>
        <button onClick={() => navigate("/gallery")} className="text-[#651F3C] hover:text-[#4D172D] underline font-medium">
          Go back to Gallery
        </button>
      </div>
    );
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = items.map((item) => {
        const productObj = item.productId && typeof item.productId === 'object' ? item.productId : null;
        const productId = productObj ? productObj._id : item.productId;

        return {
          product: productId,
          name: productObj?.name || item.title || "Product",
          qty: item.quantity,
          image: productObj?.image || item.image || item.src || item.thumbnail || "",
          price: productObj?.price || item.price || 0,
          customization: item.customization || {}
        };
      });

      const orderData = {
        orderItems,
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: delivery,
        totalPrice: grandTotal,
        deliveryDate: deliveryDate || null,
      };

      if (!user?.address) {
        try {
          await axios.put("/users/profile", { address: shipping.address });
        } catch (profileErr) {
          console.error("Failed to save address to profile:", profileErr);
        }
      }

      const { data } = await axios.post("/orders", orderData);
      
      toast.success("Order placed successfully!");
      setCompletedOrder(data);
      setShowWhatsAppPopup(true);
      clearCart();

    } catch (err) {
      console.error(err);
      toast.error("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSend = () => {
    if (!completedOrder) return;

    let message = `*New Order Placed!*\n\n`;
    message += `*Order ID:* ${completedOrder._id}\n`;
    message += `*Total Amount:* ₹${completedOrder.totalPrice}\n`;
    message += `*Payment Method:* ${completedOrder.paymentMethod}\n\n`;
    message += `*Items:*\n`;
    
    completedOrder.orderItems.forEach(item => {
      const imageUrl = toAbsoluteImageUrl(item.image || item.thumbnail);
      message += `- ${item.name} (Qty: ${item.qty}) = ₹${item.price * item.qty}\n`;
      if (imageUrl) message += `   Product Image: ${imageUrl}\n`;
      if (item.customization) {
        if (item.customization.mainColor) {
          const c1 = hexToColorName(item.customization.mainColor);
          const c2 = item.customization.secondaryColor ? hexToColorName(item.customization.secondaryColor) : "None";
          message += `   Color: ${c1}/${c2}\n`;
        }
        if (item.customization.stones) message += `   + Stones\n`;
        if (item.customization.beads) message += `   + Beads\n`;
        if (item.customization.notes) message += `   Note: ${item.customization.notes}\n`;
      }
    });

    message += `\n*Shipping Address:*\n`;
    message += `${completedOrder.shippingAddress.address}, ${completedOrder.shippingAddress.city}, ${completedOrder.shippingAddress.postalCode}, ${completedOrder.shippingAddress.country}\n`;
    if (completedOrder.deliveryDate) {
      message += `*Expected Delivery:* ${new Date(completedOrder.deliveryDate).toLocaleDateString()}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919942071721?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    setShowWhatsAppPopup(false);
    navigate(`/order-confirmation?order=${completedOrder._id}`);
  };

  const [isDarkMode] = React.useState(() => document.documentElement.classList.contains("dark"));

  return (
    <div className={`min-h-screen py-10 transition-colors duration-300 ${isDarkMode ? "bg-[#171116] text-[#FAF5EF]" : "bg-[#FAF5EF] text-[#30232A]"}`}>
      
      {/* WhatsApp Confirmation Popup */}
      {showWhatsAppPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className={`w-full max-w-lg rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden ${isDarkMode ? "bg-[#261B22] text-[#FAF5EF] border border-[#493640]" : "bg-white text-[#30232A] border border-[#E8DDD5]"}`}>
            
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold font-serif mb-4">Almost Done!</h2>
            
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${isDarkMode ? "bg-[#171116]" : "bg-[#F5EAE9]"}`}>
              <p className="mb-2">Once you have successfully placed the order here, please send the order details to us on WhatsApp.</p>
              <p className="text-[#651F3C] font-bold dark:text-[#D5B36C]">After sending the message, verify and confirm your order by calling this number: <br/><span className="text-lg">+91 9942071721</span></p>
            </div>

            <button 
              onClick={handleWhatsAppSend}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              Send to WhatsApp
            </button>
          </div>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 ${showWhatsAppPopup ? 'filter blur-sm pointer-events-none' : ''}`}>

        {/* Shipping Form */}
        <div>
          <h2 className={`text-2xl font-bold font-serif mb-6 ${isDarkMode ? "text-[#FAF5EF]" : "text-[#651F3C]"}`}>Shipping Details</h2>
          <form onSubmit={submitHandler} id="checkout-form" className={`p-6 rounded-2xl border ${isDarkMode ? "bg-[#261B22] border-[#493640] shadow-lg" : "bg-white border-[#E8DDD5] shadow-sm"}`}>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">Address</label>
                <input
                  type="text"
                  required
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"}`}
                  value={shipping.address}
                  onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                  placeholder="Street Address, Area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80">City</label>
                  <input
                    type="text"
                    required
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"}`}
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80">Postal Code</label>
                  <input
                    type="text"
                    required
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"}`}
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">Country</label>
                <input
                  type="text"
                  required
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"}`}
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">Desired Delivery Date (Optional)</label>
                <input
                  type="date"
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"}`}
                  value={deliveryDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold mb-3 font-serif">Payment Method</h3>
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === "Cash on Delivery" ? "border-[#651F3C] bg-[#F5EAE9] dark:bg-[#30232A]" : "border-[#E8DDD5] dark:border-[#493640]"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on Delivery"
                      checked={paymentMethod === "Cash on Delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-[#651F3C] focus:ring-[#651F3C]"
                    />
                    <span className="ml-3 font-medium">Cash on Delivery (COD)</span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === "Online" ? "border-[#651F3C] bg-[#F5EAE9]" : "border-[#E8DDD5] dark:border-[#493640] opacity-60"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Online"
                      disabled
                      className="text-[#651F3C] focus:ring-[#651F3C]"
                    />
                    <span className="ml-3 font-medium">Online Payment (Coming Soon)</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#651F3C] text-white py-3 rounded-xl font-bold hover:bg-[#4D172D] shadow-lg shadow-[#651F3C]/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className={`text-2xl font-bold font-serif mb-6 ${isDarkMode ? "text-[#FAF5EF]" : "text-[#651F3C]"}`}>Order Summary</h2>
          <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-[#261B22] border-[#493640] shadow-lg" : "bg-white border-[#E8DDD5] shadow-sm"}`}>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, idx) => {
                const productObj = item.productId && typeof item.productId === 'object' ? item.productId : null;
                const name = productObj?.name || item.title || "Product";
                const price = productObj?.price || item.price || 0;
                const image = productObj?.image || item.image || item.src || item.thumbnail || "";

                return (
                  <div key={idx} className="flex gap-4 border-b border-[#E8DDD5] dark:border-[#493640] pb-4 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-lg bg-[#F5EAE9] overflow-hidden flex-shrink-0 border border-[#E8DDD5] dark:border-[#493640]">
                      {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{name}</h4>
                      <p className="text-xs opacity-70">Qty: {item.quantity}</p>
                      {item.customization?.notes && (
                        <p className="text-[10px] opacity-60 italic truncate max-w-[150px]">"{item.customization.notes}"</p>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#651F3C] dark:text-[#D5B36C]">
                      ₹{(price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#E8DDD5] dark:border-[#493640] mt-6 pt-4 space-y-2 text-sm opacity-80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
               <span>Tax</span>
                <span>₹{tax?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>₹{delivery?.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="border-t border-[#E8DDD5] dark:border-[#493640] mt-4 pt-4 flex justify-between text-xl font-bold text-[#651F3C] dark:text-[#D5B36C]">
              <span>Total</span>
              <span>₹{grandTotal?.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
