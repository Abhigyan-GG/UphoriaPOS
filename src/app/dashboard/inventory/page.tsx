
"use client";

import { InventoryTable } from "@/components/inventory/inventory-table";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { CategoryManager } from "@/components/inventory/category-manager";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryPage() {
  const { data: products, loading: productsLoading } = useProducts();
  const { data: categories, loading: categoriesLoading } = useCategories();

  if (productsLoading || categoriesLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Inventory</h1>
        <div className="flex items-center gap-2">
          <AddProductDialog categories={categories || []} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryTable products={products || []} categories={categories || []} />
        </div>
        <div className="lg:col-span-1">
          <CategoryManager categories={categories || []} />
        </div>
      </div>
    </div>
  );
}
