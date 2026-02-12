import { SalesTable } from "@/components/sales/sales-table";
import type { Sale } from "@/lib/types";

// Mock sales data for demonstration
const mockSales: Sale[] = [
  {
    id: "SALE-1678886400000",
    subtotal: 2100,
    tax: 105,
    discount: 0,
    total: 2205,
    customer_phone: "+919876543210",
    invoice_pdf_url: "/invoices/SALE-1678886400000.pdf",
    whatsapp_status: "sent",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { product_id: "prod1", product_name: "Rose Perfume", quantity: 1, unit_price: 799, line_total: 799 },
      { product_id: "prod4", product_name: "Silk Scarf", quantity: 1, unit_price: 1299, line_total: 1299 }
    ]
  },
    {
    id: "SALE-1678890000000",
    subtotal: 4999,
    tax: 250,
    discount: 500,
    total: 4749,
    customer_phone: "+919123456789",
    invoice_pdf_url: "/invoices/SALE-1678890000000.pdf",
    whatsapp_status: "sent",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { product_id: "prod3", product_name: "Vintage Pistol Decor", quantity: 1, unit_price: 4999, line_total: 4999 }
    ]
  },
  {
    id: "SALE-1678976400000",
    subtotal: 598,
    tax: 29.9,
    total: 627.9,
    customer_phone: "",
    invoice_pdf_url: "/invoices/SALE-1678976400000.pdf",
    whatsapp_status: "skipped",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
       { product_id: "prod10", product_name: "Scented Candle", quantity: 1, unit_price: 599, line_total: 599 }
    ]
  },
  {
    id: "SALE-1679062800000",
    subtotal: 3599,
    tax: 180,
    total: 3779,
    customer_phone: "+919988776655",
    invoice_pdf_url: "",
    whatsapp_status: "failed",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { product_id: "prod9", product_name: "Premium Cigar Box", quantity: 1, unit_price: 3599, line_total: 3599 }
    ]
  }
];

export default function SalesPage() {
  // In a real app, this data would be fetched from Firestore
  const sales = mockSales;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-headline font-bold">Sales History</h1>
      </div>
      <SalesTable sales={sales} />
    </div>
  );
}
