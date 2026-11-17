import { useTheme } from "../hooks/useTheme";
import Dialog from "../components/Dialog";
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
  const isDarkMode = useTheme();

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F2]">
        <h2 className="text-2xl font-serif font-bold text-[#254F3C] mb-4">Your cart is empty</h2>
        <button onClick={() => navigate("/gallery")} className="text-[#254F3C] hover:text-[#183D2B] underline font-medium">
          Go back to Gallery
        </button>
      </div>
    );
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        shippingAddress: shipping,
        paymentMethod,
        deliveryDate: deliveryDate || undefined,
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
        if (item.customization.stones) message += `   + ${Array.isArray(item.customization.stones) ? item.customization.stones.join(", ") : "Stones"}\n`;
        if (item.customization.selectedFlowers?.length) message += `   Flowers: ${item.customization.selectedFlowers.join(", ")}\n`;
        if (item.customization.beads) message += `   + Beads\n`;
        if (item.customization.notes) message += `   Note: ${item.customization.notes}\n`;
        if (item.customization.hasReferencePhoto || item.customization.referenceImageName) message += `   Reference photo to be shared separately\n`;
      }
    });

    message += `\n*Shipping Address:*\n`;
    message += `${completedOrder.shippingAddress.address}, ${completedOrder.shippingAddress.city}, ${completedOrder.shippingAddress.postalCode}, ${completedOrder.shippingAddress.country}\n`;
    if (completedOrder.deliveryDate) {
      message += `*Expected Delivery:* ${new Date(completedOrder.deliveryDate).toLocaleDateString()}\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919942071721?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setShowWhatsAppPopup(false);
    navigate(`/order-confirmation?order=${completedOrder._id}`);
  };

  return (
    <div className={`min-h-screen py-10 transition-colors duration-300 ${isDarkMode ? "bg-[#141D18] text-[#F8F7F2]" : "bg-[#F8F7F2] text-[#24382F]"}`}>

      <Dialog open={showWhatsAppPopup} onClose={() => navigate('/my-orders')} title="Order received!">
        <p className="mb-6">Your order is saved. You can view its status in My orders, or share the details with the shop on WhatsApp.</p>
        <div className="button-row"><button type="button" className="button" onClick={handleWhatsAppSend}>Send to WhatsApp</button><button type="button" className="button secondary" onClick={() => navigate('/my-orders')}>View my orders</button></div>
      </Dialog>

      <div className={`max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 ${showWhatsAppPopup ? 'filter blur-sm pointer-events-none' : ''}`}>

        {/* Shipping Form */}
        <div>
          <h2 className={`text-2xl font-bold font-serif mb-6 ${isDarkMode ? "text-[#F8F7F2]" : "text-[#254F3C]"}`}>Shipping Details</h2>
          <form onSubmit={submitHandler} id="checkout-form" className={`p-6 rounded-2xl border ${isDarkMode ? "bg-[#1D2921] border-[#3F5144] shadow-lg" : "bg-white border-[#D7DDD4] shadow-sm"}`}>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">Address</label>
                <input
                  type="text"
                  required
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#254F3C] outline-none ${isDarkMode ? "bg-[#141D18] border-[#3F5144] text-white" : "bg-[#F8F7F2] border-[#D7DDD4] text-[#24382F]"}`}
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
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#254F3C] outline-none ${isDarkMode ? "bg-[#141D18] border-[#3F5144] text-white" : "bg-[#F8F7F2] border-[#D7DDD4] text-[#24382F]"}`}
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80">Postal Code</label>
                  <input
                    type="text"
                    required
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#254F3C] outline-none ${isDarkMode ? "bg-[#141D18] border-[#3F5144] text-white" : "bg-[#F8F7F2] border-[#D7DDD4] text-[#24382F]"}`}
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
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#254F3C] outline-none ${isDarkMode ? "bg-[#141D18] border-[#3F5144] text-white" : "bg-[#F8F7F2] border-[#D7DDD4] text-[#24382F]"}`}
                  value={shipping.country}
                  onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">Desired Delivery Date (Optional)</label>
                <input
                  type="date"
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-[#254F3C] outline-none ${isDarkMode ? "bg-[#141D18] border-[#3F5144] text-white" : "bg-[#F8F7F2] border-[#D7DDD4] text-[#24382F]"}`}
                  value={deliveryDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold mb-3 font-serif">Payment Method</h3>
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === "Cash on Delivery" ? "border-[#254F3C] bg-[#F5EAE9] dark:bg-[#24382F]" : "border-[#D7DDD4] dark:border-[#3F5144]"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on Delivery"
                      checked={paymentMethod === "Cash on Delivery"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-[#254F3C] focus:ring-[#254F3C]"
                    />
                    <span className="ml-3 font-medium">Cash on Delivery (COD)</span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition ${paymentMethod === "Online" ? "border-[#254F3C] bg-[#F5EAE9]" : "border-[#D7DDD4] dark:border-[#3F5144] opacity-60"}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Online"
                      disabled
                      className="text-[#254F3C] focus:ring-[#254F3C]"
                    />
                    <span className="ml-3 font-medium">Online Payment (Coming Soon)</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#254F3C] text-white py-3 rounded-xl font-bold hover:bg-[#183D2B] shadow-lg shadow-[#254F3C]/20 transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className={`text-2xl font-bold font-serif mb-6 ${isDarkMode ? "text-[#F8F7F2]" : "text-[#254F3C]"}`}>Order Summary</h2>
          <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-[#1D2921] border-[#3F5144] shadow-lg" : "bg-white border-[#D7DDD4] shadow-sm"}`}>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, idx) => {
                const productObj = item.productId && typeof item.productId === 'object' ? item.productId : null;
                const name = productObj?.name || item.title || "Product";
                const price = productObj?.price || item.price || 0;
                const image = productObj?.image || item.image || item.src || item.thumbnail || "";

                return (
                  <div key={idx} className="flex gap-4 border-b border-[#D7DDD4] dark:border-[#3F5144] pb-4 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-lg bg-[#F5EAE9] overflow-hidden flex-shrink-0 border border-[#D7DDD4] dark:border-[#3F5144]">
                      {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{name}</h4>
                      <p className="text-xs opacity-70">Qty: {item.quantity}</p>
                      {item.customization?.notes && (
                        <p className="text-[10px] opacity-60 italic truncate max-w-[150px]">"{item.customization.notes}"</p>
                      )}
                    </div>
                    <div className="text-sm font-bold text-[#254F3C] dark:text-[#D5B36C]">
                      ₹{(price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#D7DDD4] dark:border-[#3F5144] mt-6 pt-4 space-y-2 text-sm opacity-80">
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

            <div className="border-t border-[#D7DDD4] dark:border-[#3F5144] mt-4 pt-4 flex justify-between text-xl font-bold text-[#254F3C] dark:text-[#D5B36C]">
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
