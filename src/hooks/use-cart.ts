"use client";

import { useState, useMemo, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/types';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevItems,
        {
          product_id: product.id,
          product_name: product.name,
          default_price: product.price,
          final_price: product.price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateItem = useCallback((productId: string, updates: Partial<CartItem>) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId ? { ...item, ...updates } : item
      )
    );
  }, []);
  
  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.final_price * item.quantity, 0);
    // These would be calculated based on user input in a real app
    const discount = 0; 
    const tax = subtotal * 0.05; // 5% tax for example
    const total = subtotal - discount + tax;

    return { subtotal, discount, tax, total };
  }, [items]);

  return {
    items,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    totals,
  };
};

export type CartStore = ReturnType<typeof useCart>;
