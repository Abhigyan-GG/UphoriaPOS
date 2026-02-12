# Guns And Gulab - Point of Sale System

This is a modern, full-stack Point of Sale (POS) application built for the fictional high-end retail store, "Guns And Gulab". It provides a comprehensive suite of tools for staff to manage sales, inventory, and view transaction history, all wrapped in a sleek, responsive user interface.

The application is built with a powerful, modern tech stack designed for performance, scalability, and a great developer experience.

## Features

- **Staff Authentication**: Secure login for staff members using either traditional Email/Password or convenient Google Sign-In.
- **Point of Sale (POS) Interface**: An intuitive dashboard where staff can quickly search for products, add them to a sale, adjust quantities and prices, and complete transactions.
- **Inventory Management**: A complete inventory system to view all products, add new items, create product categories, and delete items. Stock levels are automatically updated after each sale.
- **Sales History**: A detailed log of all past sales, including customer information, total amount, and the status of WhatsApp invoice notifications.
- **AI-Powered Assistance**:
  - **Product Descriptions**: Automatically generate compelling and professional product descriptions using AI.
  - **WhatsApp Invoices**: Generate personalized WhatsApp messages with invoice details for customers after a sale.

## Technology Stack

- **Frontend**:
  - **Framework**: [Next.js](https://nextjs.org/) (with App Router)
  - **Language**: [TypeScript](https://www.typescriptlang.org/)
  - **UI**: [React](https://reactjs.org/)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  - **Component Library**: [ShadCN/UI](https://ui.shadcn.com/)
- **Backend & Database**:
  - **Platform**: [Firebase](https://firebase.google.com/)
  - **Services**: Firebase Authentication, Firestore Database
- **Generative AI**:
  - **Framework**: [Genkit](https://firebase.google.com/docs/genkit)
  - **Models**: Google's Gemini models

## Getting Started

The application is configured to work out-of-the-box for client-side operations like login and viewing data (assuming Firestore rules allow it).

### Enabling Server-Side Features

For server-side operations that require administrative privileges (like adding/deleting products and categories), you must configure the Firebase Admin SDK.

1.  **Generate a Service Account Key**:
    - Go to your Firebase Project Settings > Service accounts.
    - Click "Generate new private key". A JSON file will be downloaded.
2.  **Configure Environment Variable**:
    - Open the `.env` file in the root of this project.
    - Copy the entire content of the downloaded JSON file.
    - Paste it as the value for the `FIREBASE_SERVICE_ACCOUNT_KEY` variable.
3.  **Restart the Server**: Stop and restart the development server (`npm run dev`) for the changes to take effect.
