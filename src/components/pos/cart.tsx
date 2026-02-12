"use client";

import { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart, Loader2, CheckCircle } from 'lucide-react';
import { CartContext } from '@/app/dashboard/page';
import { useToast } from "@/hooks/use-toast";
import { completeSaleAction, generateWhatsappMessageAction } from '@/lib/actions';
import type { CartItem } from '@/lib/types';

export function Cart() {
  const [customerPhone, setCustomerPhone] = useState('+91');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cartContext = useContext(CartContext);
  const { toast } = useToast();

  if (!cartContext) {
    throw new Error('Cart must be used within a CartProvider');
  }

  const { items, updateItem, removeItem, clearCart, totals } = cartContext;

  const handlePriceChange = (productId: string, value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price)) {
      updateItem(productId, { final_price: price });
    }
  };

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      updateItem(productId, { quantity });
    }
  };
  
  const handleCompleteSale = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Please add products to the cart before completing a sale.",
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
      
      const whatsappResult = await generateWhatsappMessageAction({
        customerName: 'Valued Customer',
        storeName: 'Guns And Gulab',
        invoiceNumber: result.saleId,
        totalAmount: `₹${totals.total.toFixed(2)}`,
        invoiceLink: 'http://example.com/invoice.pdf',
        itemsPurchased: items.map(i => i.product_name)
      });

      console.log('WhatsApp Message Generated:', whatsappResult.message);
      
      toast({
        title: "Sale Completed!",
        description: `Sale ID: ${result.saleId}. Invoice sent.`,
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
                <div key={item.product_id} className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold">{item.product_name}</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product_id, e.target.value)}
                        className="h-8 w-20 text-center"
                        aria-label="Quantity"
                      />
                      <div className="relative">
                         <span className="absolute left-2.5 top-1.5 text-sm text-muted-foreground">₹</span>
                         <Input
                           type="number"
                           value={item.final_price}
                           onChange={(e) => handlePriceChange(item.product_id, e.target.value)}
                           className="h-8 w-28 pl-6"
                           aria-label="Final Price"
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
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span>₹{totals.tax.toFixed(2)}</span>
                </div>
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
