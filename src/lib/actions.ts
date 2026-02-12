"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { generateWhatsappInvoiceMessage } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { GenerateProductDescriptionInput } from "@/ai/flows/generate-product-description";
import type { GenerateWhatsappInvoiceMessageInput } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { Product, CartItem, SaleItem } from "./types";
import { firestoreAdmin, adminInitError } from "@/firebase/admin";

const serverSideFirebaseErrorMessage = "An unexpected error occurred with the server-side Firebase configuration.";

function checkFirebaseAdmin() {
    if (adminInitError) {
        return { success: false, message: adminInitError.message };
    }
    if (!firestoreAdmin) {
        return { success: false, message: serverSideFirebaseErrorMessage };
    }
    return { success: true, message: "" };
}

export async function addCategoryAction(categoryData: { name: string }) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    if (!categoryData.name || categoryData.name.trim() === '') {
        return { success: false, message: "Category name cannot be empty." };
    }
    try {
        const docRef = await firestoreAdmin!.collection('categories').add({
            name: categoryData.name,
        });
        revalidatePath('/dashboard/inventory');
        return { success: true, docId: docRef.id };
    } catch (error: any) {
        console.error("Error adding category:", error);
        return { success: false, message: error.message || "Failed to add category." };
    }
}

export async function addProductAction(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    try {
        const docRef = await firestoreAdmin!.collection('products').add({
            ...productData,
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
        });
        revalidatePath('/dashboard/inventory');
        return { success: true, docId: docRef.id };
    } catch (error: any) {
        console.error("Error adding product:", error);
        return { success: false, message: error.message || "Failed to add product." };
    }
}

export async function deleteProductAction(productId: string) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    try {
        await firestoreAdmin!.collection('products').doc(productId).delete();
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { success: false, message: error.message || "Failed to delete product." };
    }
}

interface SaleData {
    items: CartItem[];
    customerPhone: string;
    totals: {
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
    }
}

export async function completeSaleAction(saleData: SaleData) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    const { items, customerPhone, totals } = saleData;

    try {
        const saleItems: SaleItem[] = items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.final_price,
            line_total: item.final_price * item.quantity,
        }));
        
        const saleDoc = {
            ...totals,
            customer_phone: customerPhone,
            items: saleItems,
            created_at: FieldValue.serverTimestamp(),
            whatsapp_status: customerPhone.length > 3 ? 'pending' : 'skipped',
            invoice_pdf_url: '', // This would be generated and uploaded in a real scenario
        };

        const batch = firestoreAdmin!.batch();
        
        // 1. Create the sale document
        const saleRef = firestoreAdmin!.collection('sales').doc();
        batch.set(saleRef, saleDoc);

        // 2. Decrement stock for each product
        for (const item of items) {
            const productRef = firestoreAdmin!.collection('products').doc(item.product_id);
            batch.update(productRef, {
                stock: FieldValue.increment(-item.quantity)
            });
        }
        
        await batch.commit();
        
        revalidatePath('/dashboard/sales');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard');

        return { success: true, saleId: saleRef.id };

    } catch (error: any) {
        console.error("Error completing sale:", error);
        return { success: false, message: error.message || "Failed to complete sale." };
    }
}


export async function generateDescriptionAction(input: GenerateProductDescriptionInput) {
    try {
        const result = await generateProductDescription(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI description generation failed:", error);
        return { success: false, message: "Failed to generate description." };
    }
}

export async function generateWhatsappMessageAction(input: GenerateWhatsappInvoiceMessageInput) {
    try {
        const result = await generateWhatsappInvoiceMessage(input);
        return { success: true, message: result.message };
    } catch (error) {
        console.error("WhatsApp message generation failed:", error);
        return { success: false, message: "Failed to generate WhatsApp message." };
    }
}

export async function resendInvoiceAction(saleId: string) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;
    
    // In a real app, this would trigger a flow to resend the invoice.
    console.log(`Simulating resend of WhatsApp invoice for saleId: ${saleId}`);
    
    // As an example, let's update the status to 'pending' to re-trigger a hypothetical worker.
    try {
        await firestoreAdmin!.collection('sales').doc(saleId).update({
            whatsapp_status: 'pending'
        });
        revalidatePath('/dashboard/sales');
        return { success: true };
    } catch (error: any) {
        console.error("Error resending invoice:", error);
        return { success: false, message: "Could not resend the invoice." };
    }
}
