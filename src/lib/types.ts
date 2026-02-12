export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost_price: number;
  sku: string;
  category_id: string;
  stock: number;
  image_url: string;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  default_price: number;
  final_price: number;
  quantity: number;
}

export interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number; // final edited price
  line_total: number;
}

export interface Sale {
  id: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customer_phone: string;
  invoice_pdf_url: string;
  whatsapp_status: 'pending' | 'sent' | 'failed' | 'skipped';
  created_at: string;
  items: SaleItem[];
}
