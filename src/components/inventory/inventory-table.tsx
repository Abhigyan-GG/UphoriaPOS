"use client";

import * as React from "react";
import type { Product, Category } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { deleteProductAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface InventoryTableProps {
  products: Product[];
  categories: Category[];
}

export function InventoryTable({ products, categories }: InventoryTableProps) {
  const { toast } = useToast();

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "N/A";
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete ${productName}?`)) {
      const result = await deleteProductAction(productId);
      if (result.success) {
        toast({
          title: "Product Deleted",
          description: `${productName} has been removed from inventory.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>
                <div className="text-right">Price</div>
              </TableHead>
              <TableHead>
                <div className="text-right">Stock</div>
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={product.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={product.image_url}
                    width="64"
                    data-ai-hint="product image"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{getCategoryName(product.category_id)}</Badge>
                </TableCell>
                <TableCell className="text-right">₹{product.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                    <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>
                        {product.stock}
                    </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
