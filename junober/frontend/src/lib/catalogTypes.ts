export type GarmentType = "tshirt" | "polo" | "hoodie" | "tank";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string | null;
  product_count: number;
  sort_order: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link_url: string;
  link_label: string;
  sort_order: number;
}

export interface Color {
  id: number;
  name: string;
  slug: string;
  hex_code: string;
  sort_order: number;
}

export interface Size {
  id: number;
  code: string;
  label: string;
  chest_inches: number | null;
  length_inches: number | null;
  sort_order: number;
}

export interface PrintType {
  id: number;
  name: string;
  slug: string;
  description: string;
  surcharge: string;
  sort_order: number;
}

export interface PrintArea {
  id: number;
  name: string;
  code: string;
  print_size: "small" | "medium" | "large";
  surcharge: string;
  sort_order: number;
}

export interface Review {
  id: number;
  rating: number;
  title: string;
  body: string;
  user_name: string;
  created_at: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  garment_type: GarmentType;
  category: Category | null;
  base_price: string;
  thumbnail: string | null;
  glb_url: string;
  is_featured: boolean;
  avg_rating: number | null;
  review_count: number;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  color: Color;
  size: Size;
  additional_price: string;
  final_price: string;
  stock_count: number;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  available_colors: Color[];
  available_sizes: Size[];
  available_print_types: PrintType[];
  variants: ProductVariant[];
  images: { id: number; image: string; alt_text: string }[];
  reviews: Review[];
  review_count: number;
}
