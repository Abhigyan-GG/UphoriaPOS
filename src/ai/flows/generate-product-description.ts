'use server';
/**
 * @fileOverview A Genkit flow for generating compelling product descriptions and marketing copy.
 *
 * - generateProductDescription - A function that handles the generation of product descriptions.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  defaultPrice: z.number().describe('The default price of the product.'),
  category: z.string().optional().describe('The category of the product, if available.'),
  additionalDetails: z.string().optional().describe('Any additional details about the product to include in the description.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  productDescription: z.string().describe('A compelling and detailed product description.'),
  marketingCopy: z.string().describe('Short, engaging marketing copy for the product.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const productDescriptionPrompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are a professional marketing copywriter for "Guns And Gulab", a high-end retail store specializing in unique products. Your task is to generate a compelling product description and short, engaging marketing copy based on the provided product details.

Consider the brand's aesthetic and target audience. The tone should be sophisticated, appealing, and highlight the product's value and unique selling points.

Product Name: {{{productName}}}
Default Price: ₹{{{defaultPrice}}}
{{#if category}}Category: {{{category}}}
{{/if}}{{#if additionalDetails}}Additional Details: {{{additionalDetails}}}
{{/if}}

Please provide a detailed product description and separate, concise marketing copy.`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await productDescriptionPrompt(input);
    return output!;
  }
);
