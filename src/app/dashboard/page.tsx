"use client"

import { useState, createContext } from 'react';
import { ProductGrid } from '@/components/pos/product-grid';
import { Cart } from '@/components/pos/cart';
import { useCart, type CartStore } from '@/hooks/use-cart';

export const CartContext = createContext<CartStore | null>(null);

export default function POSPage() {
  const cart = useCart();

  return (
    <CartContext.Provider value={cart}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6 h-[calc(100vh-theme(spacing.12))]">
        <div className="lg:col-span-2 flex flex-col h-full">
          <ProductGrid />
        </div>
        <div className="lg:col-span-1 flex flex-col h-full">
          <Cart />
        </div>
      </div>
    </CartContext.Provider>
  );
}
