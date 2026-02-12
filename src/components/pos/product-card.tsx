"use client";

import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col group">
      <CardHeader className="p-0 relative">
        <Image
          src={product.image_url}
          alt={product.name}
          width={400}
          height={400}
          className="aspect-square object-cover transition-transform group-hover:scale-105"
          data-ai-hint="product image"
        />
      </CardHeader>
      <CardContent className="p-3 flex-1 flex flex-col">
        <CardTitle className="text-base font-medium leading-tight mb-1">{product.name}</CardTitle>
        <p className="text-sm font-semibold text-primary">₹{product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-2">
        <Button variant="outline" size="sm" className="w-full" onClick={onAddToCart}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
