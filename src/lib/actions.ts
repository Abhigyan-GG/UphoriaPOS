
"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { generateWhatsappInvoiceMessage } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { GenerateProductDescriptionInput } from "@/ai/flows/generate-product-description";
import type { GenerateWhatsappInvoiceMessageInput } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { Product, CartItem, SaleItem, Sale } from "./types";
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

export async function deleteCategoryAction(categoryId: string) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    try {
        // In a real app, you might check if any products are using this category.
        // For simplicity, we'll just delete it.
        await firestoreAdmin!.collection('categories').doc(categoryId).delete();
        revalidatePath('/dashboard/inventory');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return { success: false, message: error.message || "Failed to delete category." };
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
        revalidatePath('/dashboard');
        return { success: true, docId: docRef.id };
    } catch (error: any) {
        console.error("Error adding product:", error);
        return { success: false, message: error.message || "Failed to add product." };
    }
}

export async function updateProductAction(productId: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'description'>> & { description?: string }) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    try {
        const dataToUpdate: any = {
            ...productData,
            updated_at: FieldValue.serverTimestamp(),
        };

        if (typeof productData.description === 'undefined') {
            dataToUpdate.description = FieldValue.delete();
        }

        await firestoreAdmin!.collection('products').doc(productId).update(dataToUpdate);
        
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { success: false, message: error.message || "Failed to update product." };
    }
}


export async function deleteProductAction(productId: string) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    try {
        await firestoreAdmin!.collection('products').doc(productId).delete();
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard');
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
            cost_price: item.cost_price,
        }));
        
        const saleDoc = {
            ...totals,
            customer_phone: customerPhone,
            items: saleItems,
            created_at: FieldValue.serverTimestamp(),
            whatsapp_status: customerPhone && customerPhone.length > 3 ? 'pending' : 'skipped',
            invoice_pdf_url: '', // This would be generated and uploaded in a real scenario
        };

        const batch = firestoreAdmin!.batch();
        
        const saleRef = firestoreAdmin!.collection('sales').doc();
        batch.set(saleRef, saleDoc);

        for (const item of items) {
            const productRef = firestoreAdmin!.collection('products').doc(item.product_id);
            batch.update(productRef, {
                stock: FieldValue.increment(-item.quantity)
            });
        }
        
        await batch.commit();
        
        // Asynchronously send WhatsApp message without blocking the UI response
        if (saleDoc.whatsapp_status === 'pending') {
            sendWhatsappMessageAction(saleRef.id).catch(err => console.error("Failed to send WhatsApp message in background:", err));
        }
        
        revalidatePath('/dashboard/sales');
        revalidatePath('/dashboard/inventory');
        revalidatePath('/dashboard/analytics');
        revalidatePath('/dashboard');

        return { success: true, saleId: saleRef.id };

    } catch (error: any) {
        console.error("Error completing sale:", error);
        return { success: false, message: error.message || "Failed to complete sale." };
    }
}


export async function deleteSaleAction(saleId: string) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;

    try {
        // Note: This does not restore stock, which might be desired in a real "return" flow.
        await firestoreAdmin!.collection('sales').doc(saleId).delete();
        revalidatePath('/dashboard/sales');
        revalidatePath('/dashboard/analytics');
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting sale:", error);
        return { success: false, message: error.message || "Failed to delete sale." };
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

export async function sendWhatsappMessageAction(saleId: string) {
    const adminCheck = checkFirebaseAdmin();
    if (!adminCheck.success) return adminCheck;
    
    try {
        const saleDoc = await firestoreAdmin!.collection('sales').doc(saleId).get();
        if (!saleDoc.exists) {
            return { success: false, message: "Sale not found." };
        }

        const sale = saleDoc.data() as Sale;
        if (!sale || !sale.customer_phone || sale.whatsapp_status === 'skipped') {
            return { success: false, message: "No customer phone or sending is skipped for this sale." };
        }

        const whatsappInput: GenerateWhatsappInvoiceMessageInput = {
            customerName: 'Valued Customer',
            storeName: 'Guns And Gulab',
            invoiceNumber: saleId,
            totalAmount: `₹${sale.total.toFixed(2)}`,
            invoiceLink: 'http://example.com/invoice.pdf', // Placeholder
            itemsPurchased: sale.items.map((i: SaleItem) => i.product_name)
        };

        const result = await generateWhatsappInvoiceMessage(whatsappInput);
        
        if (result.message) {
            // This is where you would integrate a real WhatsApp API
            console.log("Simulating sending WhatsApp message:", result.message);
            await firestoreAdmin!.collection('sales').doc(saleId).update({
                whatsapp_status: 'sent'
            });
            revalidatePath('/dashboard/sales');
            return { success: true, message: result.message };
        } else {
            throw new Error("AI failed to generate a message.");
        }
    } catch (error: any) {
        console.error("Error sending WhatsApp message:", error);
        await firestoreAdmin!.collection('sales').doc(saleId).update({
            whatsapp_status: 'failed'
        }).catch(err => console.error("Failed to update status to 'failed':", err));
        revalidatePath('/dashboard/sales');
        return { success: false, message: "Could not send the WhatsApp invoice." };
    }
}
