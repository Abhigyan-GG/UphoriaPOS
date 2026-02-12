# **App Name**: Guns And Gulab POS

## Core Features:

- Product Grid: Display products from Firestore with real-time stock updates and low stock warnings.
- Cart Management: Enable users to add products to a cart, with manual price overrides, discounts, and quantity adjustments, the AI tool will confirm that line items match the final subtotal.
- Sales Transactions: Record sales transactions in Firestore, including subtotal, tax, discounts, customer phone number, and a link to the generated PDF invoice.
- Invoice Generation: Automatically generate PDF invoices upon sale completion and store them in Firebase Storage.
- WhatsApp Delivery: Send invoice links to customers via WhatsApp using a Firebase Cloud Function and track delivery status.
- Inventory Management: Manage product inventory, including name, price, cost, SKU, category, stock, and image URL, with real-time updates and stock change tracking.
- Role Based Access Control: Secure Firestore with rules to allow only authenticated staff to create sales and modify inventory, preventing public write access.

## Style Guidelines:

- Primary color: Rich maroon (#800000) for sophistication and confidence, aligning with the Guns And Gulab brand.
- Background color: Light desaturated brown (#E5D8D1) to create a soft, inviting feel.
- Accent color: Gold (#D4AF37) as a highlight, drawing customer attention to Calls To Action and value pricing
- Headline font: 'Playfair', a serif with a fashionable, high-end feel.
- Body font: 'PT Sans' sans-serif. Note: 'Playfair' for headers, 'PT Sans' for the body is the recommended font pairing
- Use clear and professional icons for product categories and actions.
- Maintain a clean and organized layout for easy navigation.