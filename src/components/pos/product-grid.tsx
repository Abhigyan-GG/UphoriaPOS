"use client"

import { useState, useMemo, useContext } from 'react';
import { ProductCard } from './product-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CartContext } from '@/app/dashboard/page';
import { useProducts } from '@/hooks/use-products';
import { Skeleton } from '../ui/skeleton';

export function ProductGrid() {
  const [searchTerm, setSearchTerm] = useState('');
  const cartContext = useContext(CartContext);
  const { data: products, loading: productsLoading } = useProducts();

  if (!cartContext) {
    throw new Error('ProductGrid must be used within a CartProvider');
  }
  const { addToCart } = cartContext;

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Products</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-theme(spacing.64))]">
          {productsLoading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 pt-0">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6 pt-0">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
