"use server";

import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { generateWhatsappInvoiceMessage } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { GenerateProductDescriptionInput } from "@/ai/flows/generate-product-description";
import type { GenerateWhatsappInvoiceMessageInput } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { CartItem, Product } from "./types";
import { adminDb } from "./firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

interface SaleData {
  items: (CartItem & { line_total: number })[];
  customerPhone: string;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
}

export async function addProductAction(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    try {
        const product = {
            ...productData,
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
        }
        const docRef = await adminDb.collection('products').add(product);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, message: "Failed to add product." };
    }
}

export async function deleteProductAction(productId: string) {
    try {
        await adminDb.collection('products').doc(productId).delete();
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, message: "Failed to delete product." };
    }
}

export async function completeSaleAction(saleData: SaleData) {
    try {
        const saleRef = adminDb.collection('sales').doc();
        const batch = adminDb.batch();

        // 1. Create sale document
        const saleRecord = {
          ...saleData.totals,
          customer_phone: saleData.customerPhone,
          whatsapp_status: saleData.customerPhone ? "pending" : "skipped",
          created_at: FieldValue.serverTimestamp(),
          items: saleData.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.final_price,
            line_total: item.line_total,
          })),
        };
        batch.set(saleRef, saleRecord);

        // 2. Reduce product stock
        saleData.items.forEach((item) => {
            const productRef = adminDb.collection('products').doc(item.product_id);
            batch.update(productRef, { stock: FieldValue.increment(-item.quantity) });
        });

        await batch.commit();

        console.log(`Simulating trigger of 'sendWhatsAppInvoice' for saleId: ${saleRef.id}`);

        return { success: true, saleId: saleRef.id };
    } catch (error) {
        console.error("Error completing sale:", error);
        return { success: false, message: "Failed to complete sale." };
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
    console.log(`Simulating resend of WhatsApp invoice for saleId: ${saleId}`);
    // In a real app, this would re-trigger the Firebase Cloud Function
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}
