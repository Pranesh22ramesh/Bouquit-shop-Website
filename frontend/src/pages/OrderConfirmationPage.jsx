// src/pages/OrderConfirmationPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../api/axios";

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      axios.get(`/orders/${orderId}`)
        .then(res => setOrder(res.data))
        .catch(console.error);
    }
  }, [orderId]);

  const [isDarkMode] = React.useState(() => document.documentElement.classList.contains("dark"));

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-[#fff9f7] text-rose-900"}`}>

      <div className={`max-w-md w-full p-8 rounded-3xl shadow-xl text-center ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="opacity-70 mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {order && (
          <div className="bg-gray-50/50 p-4 rounded-xl text-left text-sm mb-6 border border-gray-100">
            <p><span className="font-semibold">Order ID:</span> {order._id}</p>
            <p><span className="font-semibold">Amount:</span> ₹{order.totalPrice?.toLocaleString("en-IN")}</p>
            <p><span className="font-semibold">Payment:</span> {order.paymentMethod}</p>
            <p className="mt-2 text-xs opacity-60">We have sent a confirmation email to {order.user?.email}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link to="/my-orders" className="block w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition">
            Track Order
          </Link>
          <Link to="/gallery" className="block w-full py-3 border border-rose-200 text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition">
            Continue Shopping
          </Link>
        </div>
      </div>

    </div>
  );
};

export default OrderConfirmationPage;
