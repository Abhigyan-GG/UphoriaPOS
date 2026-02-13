
"use client";

import { useState, useMemo, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/types';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product_id === product.id);
      if (existingItem) {
        // Do not add if quantity would exceed stock
        if (existingItem.quantity >= product.stock) {
          return prevItems;
        }
        return prevItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      if (product.stock < 1) {
        return prevItems; // Do not add out of stock items
      }
      return [
        ...prevItems,
        {
          product_id: product.id,
          product_name: product.name,
          default_price: product.price,
          final_price: product.price,
          quantity: 1,
          cost_price: product.cost_price,
          stock: product.stock,
        },
      ];
    });
  }, []);

  const updateItem = useCallback((productId: string, updates: Partial<Pick<CartItem, 'quantity' | 'final_price'>>) => {
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
    const subtotal = items.reduce((acc, item) => {
        const quantity = isNaN(item.quantity) ? 0 : item.quantity;
        const price = isNaN(item.final_price) ? 0 : item.final_price;
        return acc + price * quantity;
    }, 0);
    const discount = 0; 
    const tax = 0;
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
