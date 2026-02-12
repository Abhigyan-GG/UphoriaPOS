"use client";

import { InventoryTable } from "@/components/inventory/inventory-table";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";
import { AddCategoryDialog } from "@/components/inventory/add-category-dialog";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

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
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Inventory</h1>
        <div className="flex items-center gap-2">
          <AddCategoryDialog />
          <AddProductDialog categories={categories || []} />
        </div>
      </div>
      <InventoryTable products={products || []} categories={categories || []} />
    </div>
  );
}
