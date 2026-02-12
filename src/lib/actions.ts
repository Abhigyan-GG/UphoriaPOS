"use server";

import { generateProductDescription } from "@/ai/flows/generate-product-description";
import { generateWhatsappInvoiceMessage } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { GenerateProductDescriptionInput } from "@/ai/flows/generate-product-description";
import type { GenerateWhatsappInvoiceMessageInput } from "@/ai/flows/generate-whatsapp-invoice-message";
import type { CartItem } from "./types";

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

export async function completeSaleAction(saleData: SaleData) {
  console.log("Simulating sale completion...");
  console.log("Sale Data:", JSON.stringify(saleData, null, 2));

  // 1. Create a Sale document in Firestore (Simulated)
  const saleId = `SALE-${Date.now()}`;
  const saleRecord = {
    id: saleId,
    ...saleData.totals,
    customer_phone: saleData.customerPhone,
    whatsapp_status: saleData.customerPhone ? "pending" : "skipped",
    created_at: new Date().toISOString(),
    items: saleData.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.final_price,
      line_total: item.line_total,
    })),
  };
  console.log("Simulated Firestore 'sales' write:", saleRecord);

  // 2. Reduce product stock in a transaction (Simulated)
  console.log("Simulating stock reduction...");
  saleData.items.forEach((item) => {
    console.log(
      `- Reducing stock for ${item.product_name} (ID: ${item.product_id}) by ${item.quantity}`
    );
  });
  
  // 3. Trigger Cloud Function (Simulated)
  console.log(`Simulating trigger of 'sendWhatsAppInvoice' for saleId: ${saleId}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { success: true, saleId: saleId };
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
