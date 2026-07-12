import { api } from "./api";
import type {
  Banner,
  Category,
  Color,
  PrintArea,
  PrintType,
  ProductDetail,
  ProductListItem,
  Size,
} from "./catalogTypes";

const root = "/api/catalog";

export async function fetchBanners(): Promise<Banner[]> {
  const { data } = await api.get<Banner[]>(`${root}/banners/`);
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>(`${root}/categories/`);
  return data;
}

export async function fetchProducts(params?: Record<string, string>): Promise<ProductListItem[]> {
  const { data } = await api.get<ProductListItem[]>(`${root}/products/`, { params });
  return data;
}

export async function fetchFeaturedProducts(): Promise<ProductListItem[]> {
  const { data } = await api.get<ProductListItem[]>(`${root}/products/featured/`);
  return data;
}

export async function fetchProduct(slug: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`${root}/products/${slug}/`);
  return data;
}

export async function fetchColors(): Promise<Color[]> {
  const { data } = await api.get<Color[]>(`${root}/colors/`);
  return data;
}

export async function fetchSizes(): Promise<Size[]> {
  const { data } = await api.get<Size[]>(`${root}/sizes/`);
  return data;
}

export async function fetchPrintTypes(): Promise<PrintType[]> {
  const { data } = await api.get<PrintType[]>(`${root}/print-types/`);
  return data;
}

export async function fetchPrintAreas(): Promise<PrintArea[]> {
  const { data } = await api.get<PrintArea[]>(`${root}/print-areas/`);
  return data;
}

// Admin APIs
export async function adminFetchProducts() {
  const { data } = await api.get(`${root}/admin-api/products/`);
  return data;
}

export async function adminCreateProduct(formData: FormData) {
  const { data } = await api.post(`${root}/admin-api/products/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function adminUpdateProduct(slug: string, formData: FormData) {
  const { data } = await api.patch(`${root}/admin-api/products/${slug}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function adminDeleteProduct(slug: string) {
  await api.delete(`${root}/admin-api/products/${slug}/`);
}

export async function adminFetchVariants(productSlug: string) {
  const { data } = await api.get(
    `${root}/admin-api/variants/by-product/${productSlug}/`
  );
  return data;
}

export async function adminUpdateVariant(id: number, patch: Record<string, unknown>) {
  const { data } = await api.patch(`${root}/admin-api/variants/${id}/`, patch);
  return data;
}

export async function adminFetchBanners() {
  const { data } = await api.get(`${root}/admin-api/banners/`);
  return data;
}

export async function adminCreateBanner(formData: FormData) {
  const { data } = await api.post(`${root}/admin-api/banners/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function adminDeleteBanner(id: number) {
  await api.delete(`${root}/admin-api/banners/${id}/`);
}

export async function fetchDashboard() {
  const { data } = await api.get(`${root}/admin-api/dashboard/`);
  return data;
}
