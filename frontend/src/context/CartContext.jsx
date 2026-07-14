import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { userService } from "../api/userService";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";

const CART_KEY = "midhunya_cart_v1";
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const readGuestCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems(readGuestCart());
      return;
    }

    try {
      const data = await userService.getCart();
      setItems(data);
    } catch (error) {
      console.error("Failed to load cart from API", error);
      setItems([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart, user?._id]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return subscribeToSiteEvent(SITE_EVENTS.privateCartChanged, () => loadCart());
  }, [isAuthenticated, loadCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch {
        // ignore localStorage write failures
      }
    }
  }, [items, isAuthenticated]);

  const addItem = async (newItem) => {
    if (isAuthenticated) {
      try {
        const data = await userService.addToCart({
          productId: newItem.productId,
          quantity: newItem.quantity,
          customization: newItem.customization || {},
        });
        setItems(data);
      } catch (error) {
        console.error("Add to cart failed", error);
        throw error;
      }
      return;
    }

    setItems((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          JSON.stringify(item.customization || {}) === JSON.stringify(newItem.customization || {})
      );

      if (index > -1) {
        const next = [...prev];
        next[index] = { ...next[index], quantity: next[index].quantity + newItem.quantity };
        return next;
      }

      return [...prev, { ...newItem, cartId: `c_${Date.now()}_${Math.random()}` }];
    });
  };

  const updateQty = async (cartId, qty) => {
    if (isAuthenticated) {
      try {
        const data = await userService.updateCart({ itemId: cartId, quantity: qty });
        setItems(data);
      } catch (error) {
        console.error("Update cart failed", error);
        throw error;
      }
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.cartId === cartId || item._id === cartId ? { ...item, quantity: Math.max(1, qty) } : item))
    );
  };

  const removeItem = async (cartId) => {
    if (isAuthenticated) {
      try {
        const data = await userService.removeCartItem(cartId);
        setItems(data);
      } catch (error) {
        console.error("Remove cart failed", error);
        throw error;
      }
      return;
    }

    setItems((prev) => prev.filter((item) => item.cartId !== cartId && item._id !== cartId));
  };

  const clearCart = () => {
    setItems([]);
    if (!isAuthenticated) {
      try {
        localStorage.removeItem(CART_KEY);
      } catch {
        // ignore localStorage delete failures
      }
    }
  };

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const product = item.productId && typeof item.productId === "object" ? item.productId : null;
        const baseUnitPrice =
          product?.offerPrice && product?.badge === "Offer"
            ? product.offerPrice
            : product?.price || item.unitPriceWithExtras || item.unitPrice || item.price || 0;
        // Add customization extras
        const extrasPrice =
          (item.customization?.stones ? 200 : 0) +
          (item.customization?.beads ? 120 : 0);
        const unitPrice = baseUnitPrice + extrasPrice;
        return sum + unitPrice * (item.quantity || 1);
      }, 0),
    [items]
  );

  const tax = 0;
  const delivery = 0;
  const grandTotal = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        refreshCart: loadCart,
        subtotal,
        tax,
        delivery,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
