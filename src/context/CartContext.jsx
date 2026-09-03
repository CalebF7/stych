import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const CartContext = createContext();

const CART_STORAGE_KEY = 'stych_cart_items_v2';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
    return [];
  });

  const [toast, setToast] = useState({ visible: false, message: '', item: null });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  const showToast = (message, item = null) => {
    setToast({ visible: true, message, item });
    setTimeout(() => {
      setToast({ visible: false, message: '', item: null });
    }, 3500);
  };

  const addToCart = (product, selectedSize = 'L', quantity = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        // Immutably update the quantity — spread to avoid mutating state object directly
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            selectedSize,
            quantity,
            images: product.images,
            slug: product.slug,
            category: product.category,
            stockQuantity: product.stockQuantity ?? (product.inStock ? 15 : 99),
            inStock: product.inStock
          }
        ];
      }
    });

    // Fire subtle celebration particles
    try {
      confetti({
        particleCount: 28,
        spread: 55,
        origin: { y: 0.85, x: 0.9 },
        colors: ['#FFFFFF', '#C5A880', '#111111']
      });
    } catch (e) {
      // safe fallback
    }

    showToast(`Added ${product.name} (${selectedSize}) to your bag`, product);
  };

  const removeFromCart = (id, selectedSize) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === selectedSize)));
    showToast('Item removed from your bag');
  };

  const updateQuantity = (id, selectedSize, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, selectedSize);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.selectedSize === selectedSize
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartSubtotal,
      toast,
      setToast
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
