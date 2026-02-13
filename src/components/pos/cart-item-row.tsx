
'use client';

import { useContext } from 'react';
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

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const num = parseInt(value, 10);

    if (value === "" || (num > 0 && num <= item.stock)) {
        updateItem(item.product_id, { quantity: num });
    } else if (num > item.stock) {
        toast({
            variant: "destructive",
            title: "Stock limit reached",
            description: `Only ${item.stock} available for ${item.product_name}.`
        });
        updateItem(item.product_id, { quantity: item.stock });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty or partial numbers for better typing experience
    if (value === "" || !isNaN(parseFloat(value))) {
        updateItem(item.product_id, { final_price: parseFloat(value) });
    }
  };

  const handlePriceBlur = () => {
    if (isNaN(item.final_price)) {
        updateItem(item.product_id, { final_price: item.default_price });
    } else if (item.final_price < item.cost_price) {
      toast({
        variant: 'destructive',
        title: 'Invalid Price',
        description: `Price for ${item.product_name} cannot be below the cost of ₹${item.cost_price.toFixed(2)}.`,
      });
      updateItem(item.product_id, { final_price: item.cost_price });
    }
  };
  
  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 space-y-2">
        <p className="font-semibold">{item.product_name}</p>
        <div className="flex gap-2">
          <Input
            type="number"
            value={isNaN(item.quantity) ? '' : item.quantity}
            onChange={handleQuantityChange}
            className="h-8 w-20 text-center"
            aria-label="Quantity"
            max={item.stock}
          />
          <div className="relative">
             <span className="absolute left-2.5 top-1.5 text-sm text-muted-foreground">₹</span>
             <Input
               type="number"
               value={isNaN(item.final_price) ? '' : item.final_price}
               onChange={handlePriceChange}
               onBlur={handlePriceBlur}
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
