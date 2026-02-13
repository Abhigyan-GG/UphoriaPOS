
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { addCategoryAction, deleteCategoryAction } from "@/lib/actions";

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ variant: "destructive", title: "Category name cannot be empty." });
      return;
    }
    setIsAdding(true);
    const result = await addCategoryAction({ name: newCategoryName });
    if (result.success) {
      toast({ title: "Category Added", description: `${newCategoryName} has been added.` });
      setNewCategoryName("");
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsAdding(false);
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(categoryId);
    const result = await deleteCategoryAction(categoryId);
    if (result.success) {
      toast({ title: "Category Deleted", description: `${categoryName} has been removed.` });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setDeletingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>Manage your product categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 pr-4">
          <div className="space-y-2">
            {categories.length > 0 ? (
              categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    disabled={deletingId === cat.id}
                  >
                    {deletingId === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No categories yet.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex gap-2 border-t pt-6">
        <Input
          placeholder="New category name..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
        />
        <Button onClick={handleAddCategory} disabled={isAdding}>
          {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
