
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Loader2 } from "lucide-react";
import type { Category, Product } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { generateDescriptionAction, updateProductAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  cost_price: z.coerce.number().min(0, 'Cost price must be non-negative'),
  sku: z.string().min(1, 'SKU is required'),
  category_id: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer'),
  description: z.string().optional(),
});

type ProductFormValues = Omit<z.infer<typeof productSchema>, 'image_url'>;

interface EditProductDialogProps {
  product: Product;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({ product, categories, open, onOpenChange }: EditProductDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      price: product.price,
      cost_price: product.cost_price,
      sku: product.sku,
      category_id: product.category_id,
      stock: product.stock,
      description: product.description || '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDescription = async () => {
    const { name, price, category_id } = form.getValues();
    if (!name || !price) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a product name and price to generate a description.",
      });
      return;
    }
    
    setIsGenerating(true);
    const category = categories.find(c => c.id === category_id)?.name;
    const result = await generateDescriptionAction({ productName: name, defaultPrice: price, category });
    setIsGenerating(false);

    if (result.success && result.data) {
      form.setValue('description', result.data.productDescription);
      toast({
        title: "Description Generated!",
        description: "The product description has been filled in.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate an AI description.",
      });
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    const result = await updateProductAction(product.id, {
      ...data,
      image_url: imagePreview || product.image_url,
    });

    if (result.success) {
      toast({
        title: "Product Updated",
        description: `${data.name} has been updated.`,
      });
      onOpenChange(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error updating product",
        description: result.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="font-headline">Edit Product</DialogTitle>
              <DialogDescription>
                Update the product details below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="category_id" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                 )}/>
                 <FormField control={form.control} name="cost_price" render={({ field }) => (
                    <FormItem><FormLabel>Cost (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                 )}/>
                 <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                 )}/>
              </div>
              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </FormControl>
                {imagePreview && (
                  <div className="mt-4">
                    <Image src={imagePreview} alt="Product preview" width={100} height={100} className="rounded-md object-cover" />
                  </div>
                )}
                <FormMessage />
              </FormItem>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Description</FormLabel>
                      <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate with AI
                      </Button>
                    </div>
                    <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
