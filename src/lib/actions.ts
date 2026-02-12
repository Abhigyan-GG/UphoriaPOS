"use server";

import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { generateWhatsappInvoiceMessage } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { GenerateProductDescriptionInput } from "@/ai/flows/generate-product-description";
import type { GenerateWhatsappInvoiceMessageInput } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { Product } from "./types";


export async function addProductAction(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    console.warn("addProductAction called, but is temporarily disabled.", productData);
    return { success: false, message: "Adding products is temporarily disabled while we fix authentication." };
}

export async function deleteProductAction(productId: string) {
    console.warn("deleteProductAction called, but is temporarily disabled.", productId);
    return { success: false, message: "Deleting products is temporarily disabled while we fix authentication." };
}

export async function completeSaleAction(saleData: any) {
    console.warn("completeSaleAction called, but is temporarily disabled.", saleData);
    return { success: false, message: "Completing sales is temporarily disabled while we fix authentication." };
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
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}
