
'use client';

import { useState, useEffect, useContext } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { CartContext } from '@/app/dashboard/page';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const cartContext = useContext(CartContext);
  if (!cartContext) throw new Error('CartItemRow must be used within a CartProvider');
  
  const { updateItem, removeItem } = cartContext;
  const { toast } = useToast();

  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [price, setPrice] = useState(item.final_price.toString());

  useEffect(() => {
    setQuantity(item.quantity.toString());
  }, [item.quantity]);

  useEffect(() => {
    // Only update from parent if not currently being edited, to avoid cursor jumps
    if (parseFloat(price) !== item.final_price) {
        setPrice(item.final_price.toString());
    }
  }, [item.final_price]);

  const handleQuantityBlur = () => {
    const num = parseInt(quantity, 10);
    if (isNaN(num) || num <= 0) {
      setQuantity(item.quantity.toString()); // revert
    } else {
      updateItem(item.product_id, { quantity: num });
    }
  };

  const handlePriceBlur = () => {
    const num = parseFloat(price);
    if (isNaN(num) || num < 0) { // allow 0
      setPrice(item.final_price.toString()); // revert
    } else if (num < item.cost_price) {
      toast({
        variant: 'destructive',
        title: 'Invalid Price',
        description: `Price cannot be below the cost price of ₹${item.cost_price.toFixed(2)}.`,
      });
      setPrice(item.final_price.toString()); // revert
    } else {
      updateItem(item.product_id, { final_price: num });
    }
  };
  
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 space-y-2">
        <p className="font-semibold">{item.product_name}</p>
        <div className="flex gap-2">
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={handleQuantityBlur}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="h-8 w-20 text-center"
            aria-label="Quantity"
          />
          <div className="relative">
             <span className="absolute left-2.5 top-1.5 text-sm text-muted-foreground">₹</span>
             <Input
               type="number"
               value={price}
               onChange={(e) => setPrice(e.target.value)}
               onBlur={handlePriceBlur}
               onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
               className="h-8 w-28 pl-6"
               aria-label="Final Price"
               step="0.01"
             />
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">₹{(item.final_price * item.quantity).toFixed(2)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => removeItem(item.product_id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
