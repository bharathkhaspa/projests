import type { Color, Size, PrintType } from "./catalogTypes";

export interface Address {
  id: number;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type AddressInput = Omit<Address, "id" | "created_at" | "updated_at">;

export interface CartItemVariant {
  id: number;
  sku: string;
  color: Color;
  size: Size;
  product_name: string;
  product_slug: string;
  product_thumbnail: string | null;
  glb_url: string;
}

export interface CartItem {
  id: number;
  variant: CartItemVariant;
  print_type: PrintType;
  quantity: number;
  design_text: string;
  design_text_color: string;
  design_image_url: string;
  unit_price: string;
  line_total: string | number;
  created_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: string;
  item_count: number;
  updated_at: string;
}

export interface AddCartItemPayload {
  variant_id: number;
  print_type_id: number;
  quantity?: number;
  design_text?: string;
  design_text_color?: string;
  design_image_url?: string;
}

export interface DesignUploadResult {
  id: number;
  url: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  variant_sku: string;
  product_name: string;
  color_name: string;
  size_code: string;
  print_type_name: string;
  quantity: number;
  unit_price: string;
  line_total: string | number;
  design_text: string;
  design_image_url: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  shipping_address: Address;
  subtotal: string;
  shipping_charge: string;
  total: string;
  notes: string;
  tracking_number: string;
  items: OrderItem[];
  customer_email: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
}
