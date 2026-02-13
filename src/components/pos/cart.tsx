
"use client";

import { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Loader2, CheckCircle } from 'lucide-react';
import { CartContext } from '@/app/dashboard/page';
import { useToast } from "@/hooks/use-toast";
import { completeSaleAction } from '@/lib/actions';
import { CartItemRow } from './cart-item-row';

export function Cart() {
  const [customerPhone, setCustomerPhone] = useState('+91');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cartContext = useContext(CartContext);
  const { toast } = useToast();

  if (!cartContext) {
    throw new Error('Cart must be used within a CartProvider');
  }

  const { items, clearCart, totals } = cartContext;

  const handleCompleteSale = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Please add products to the cart before completing a sale.",
      });
      return;
    }

    const invalidItem = items.find(item => item.final_price < item.cost_price);
    if (invalidItem) {
        toast({
            variant: "destructive",
            title: "Invalid Price",
            description: `The price for "${invalidItem.product_name}" is below its cost. Please adjust the price.`,
        });
        return;
    }
    
    setIsProcessing(true);
    const saleData = {
      items: items.map(item => ({
        ...item,
        line_total: item.final_price * item.quantity
      })),
      customerPhone,
      totals,
    };

    const result = await completeSaleAction(saleData);

    if (result.success && result.saleId) {
      toast({
        title: "Sale Completed!",
        description: `Sale ID: ${result.saleId}.`,
        action: <div className="p-1"><CheckCircle className="text-green-500" /></div>,
      });
      clearCart();
      setCustomerPhone('+91');
    } else {
      toast({
        variant: "destructive",
        title: "Sale Failed",
        description: result.message || "An unknown error occurred.",
      });
    }
    setIsProcessing(false);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Current Sale</CardTitle>
        <CardDescription>Manage items for checkout.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6 pt-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
              <ShoppingCart className="w-12 h-12 mb-4" />
              <p>Your cart is empty.</p>
              <p className="text-xs">Add products to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow key={item.product_id} item={item} />
              ))}
            </div>
          )}
          </div>
        </ScrollArea>
        {items.length > 0 && (
          <div className="p-6 border-t">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{totals.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-4 p-6 border-t">
        <div className="space-y-2">
            <Label htmlFor="customer-phone">Customer WhatsApp (Optional)</Label>
            <Input 
                id="customer-phone" 
                placeholder="+919876543210" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
            />
        </div>
        <Button size="lg" className="w-full text-lg h-12 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCompleteSale} disabled={isProcessing}>
            {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
                <CheckCircle className="mr-2 h-5 w-5" />
            )}
            Complete Sale
        </Button>
      </CardFooter>
    </Card>
  );
}
