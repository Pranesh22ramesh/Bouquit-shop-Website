import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { userService } from "../api/userService";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";

const CART_KEY = "midhunya_cart_v1";
const CartContext = createContext();
const stonePrices = { Crystals: 250, "Pearl Beads": 200, "Kundan Highlights": 300 };
const flowerPrices = { Orchid: 300, Lotus: 400 };

export const getCartItemUnitPrice = (item) => {
  const product = item?.productId && typeof item.productId === "object" ? item.productId : null;
  const basePrice = product
    ? (product.offerPrice && product.badge === "Offer" ? product.offerPrice : product.price || 0)
    : item?.unitPriceWithExtras || item?.unitPrice || item?.price || item?.pricing?.itemPrice || 0;
  if (!product) return Number(basePrice) || 0;

  const customization = item.customization || {};
  const stones = Array.isArray(customization.stones)
    ? [...new Set(customization.stones)].reduce((sum, name) => sum + (stonePrices[name] || 0), 0)
    : customization.stones ? 200 : 0;
  const flowers = Array.isArray(customization.selectedFlowers)
    ? [...new Set(customization.selectedFlowers)].reduce((sum, name) => sum + (flowerPrices[name] || 0), 0)
    : 0;
  const multicolor = customization.primaryColor === "Multicolor" || new Set(customization.secondaryColors || []).size >= 2 ? 200 : 0;
  return (Number(basePrice) || 0) + stones + flowers + (customization.beads ? 120 : 0) + multicolor;
};

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
      let data = await userService.getCart();
      const guestItems = readGuestCart();
      if (guestItems.length) {
        for (let index = 0; index < guestItems.length; index += 1) {
          const guestItem = guestItems[index];
          if (!guestItem.productId || typeof guestItem.productId !== "string") continue;
          data = await userService.addToCart({
            productId: guestItem.productId,
            quantity: Math.min(99, Math.max(1, Number(guestItem.quantity) || 1)),
            customization: guestItem.customization || {},
          });
          localStorage.setItem(CART_KEY, JSON.stringify(guestItems.slice(index + 1)));
        }
        localStorage.removeItem(CART_KEY);
      }
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
      prev.map((item) => (item.cartId === cartId || item._id === cartId ? { ...item, quantity: Math.min(99, Math.max(1, qty)) } : item))
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
      items.reduce((sum, item) => sum + getCartItemUnitPrice(item) * (item.quantity || 1), 0),
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
