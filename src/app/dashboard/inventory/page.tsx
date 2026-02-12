import { InventoryTable } from "@/components/inventory/inventory-table";
import { PRODUCTS, CATEGORIES } from "@/lib/data";
import { AddProductDialog } from "@/components/inventory/add-product-dialog";

export default function InventoryPage() {
  // In a real app, this data would be fetched from Firestore
  const products = PRODUCTS;
  const categories = CATEGORIES;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Inventory</h1>
        <AddProductDialog categories={categories} />
      </div>
      <InventoryTable products={products} categories={categories} />
    </div>
  );
}
