'use server';
/**
 * @fileOverview A Genkit flow for generating personalized WhatsApp messages for customers.
 *
 * - generateWhatsappInvoiceMessage - A function that handles the generation of the WhatsApp message.
 * - GenerateWhatsappInvoiceMessageInput - The input type for the generateWhatsappInvoiceMessage function.
 * - GenerateWhatsappInvoiceMessageOutput - The return type for the generateWhatsappInvoiceMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWhatsappInvoiceMessageInputSchema = z.object({
  customerName: z
    .string()
    .optional()
    .describe('The name of the customer, if available.'),
  storeName: z.string().describe('The name of the store (e.g., Guns And Gulab).'),
  invoiceNumber: z.string().describe('The unique invoice number for the sale.'),
  totalAmount: z
    .string()
    .describe('The total amount of the purchase (e.g., \'₹2100\').'),
  invoiceLink: z
    .string()
    .url()
    .describe('The secure, signed URL to download the PDF invoice.'),
  itemsPurchased: z
    .array(z.string())
    .optional()
    .describe(
      'An optional list of items purchased to include in the message for personalization.'
    ),
});
export type GenerateWhatsappInvoiceMessageInput = z.infer<
  typeof GenerateWhatsappInvoiceMessageInputSchema
>;

const GenerateWhatsappInvoiceMessageOutputSchema = z.object({
  message: z.string().describe('The personalized WhatsApp message content.'),
});
export type GenerateWhatsappInvoiceMessageOutput = z.infer<
  typeof GenerateWhatsappInvoiceMessageOutputSchema
>;

export async function generateWhatsappInvoiceMessage(
  input: GenerateWhatsappInvoiceMessageInput
): Promise<GenerateWhatsappInvoiceMessageOutput> {
  return generateWhatsappInvoiceMessageFlow(input);
}

const generateWhatsappMessagePrompt = ai.definePrompt({
  name: 'generateWhatsappInvoiceMessagePrompt',
  input: {schema: GenerateWhatsappInvoiceMessageInputSchema},
  output: {schema: GenerateWhatsappInvoiceMessageOutputSchema},
  prompt: `You are an assistant that generates personalized WhatsApp messages for customers after they complete a purchase.
The goal is to provide a friendly and engaging message, encouraging repeat business.

Here's the sale information:
Store Name: {{{storeName}}}
Invoice Number: {{{invoiceNumber}}}
Total Amount: {{{totalAmount}}}
Invoice Link: {{{invoiceLink}}}
{{#if customerName}}Customer Name: {{{customerName}}}{{/if}}
{{#if itemsPurchased}}Items Purchased:
{{#each itemsPurchased}}- {{{this}}}
{{/each}}{{/if}}

Generate a personalized WhatsApp message for the customer.
If a customer name is provided, address them by name. If not, use a general greeting.
Start with a friendly greeting and thank them for shopping at {{{storeName}}}.
Mention the invoice number and the total amount.
Encourage them to download their invoice using the provided link.
If specific items are purchased, you can briefly and positively reference them to enhance personalization.
Keep the tone warm, appreciative, and concise for WhatsApp.

Your message:`,
});

const generateWhatsappInvoiceMessageFlow = ai.defineFlow(
  {
    name: 'generateWhatsappInvoiceMessageFlow',
    inputSchema: GenerateWhatsappInvoiceMessageInputSchema,
    outputSchema: GenerateWhatsappInvoiceMessageOutputSchema,
  },
  async (input) => {
    const {output} = await generateWhatsappMessagePrompt(input);
    return output!;
  }
);
