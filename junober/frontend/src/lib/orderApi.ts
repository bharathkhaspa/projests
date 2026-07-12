import { api } from "./api";
import type {
  AddCartItemPayload,
  Address,
  AddressInput,
  Cart,
  CartItem,
  DesignUploadResult,
  Order,
} from "./orderTypes";

const root = "/api/orders";

// --- Cart ---

export async function fetchCart(): Promise<Cart> {
  const { data } = await api.get<Cart>(`${root}/cart/`);
  return data;
}

export async function addCartItem(payload: AddCartItemPayload): Promise<CartItem> {
  const { data } = await api.post<CartItem>(`${root}/cart/items/`, payload);
  return data;
}

export async function updateCartItem(id: number, quantity: number): Promise<CartItem> {
  const { data } = await api.patch<CartItem>(`${root}/cart/items/${id}/`, { quantity });
  return data;
}

export async function removeCartItem(id: number): Promise<void> {
  await api.delete(`${root}/cart/items/${id}/`);
}

export async function clearCart(): Promise<Cart> {
  const { data } = await api.delete<Cart>(`${root}/cart/clear/`);
  return data;
}

// --- Addresses ---

export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await api.get<Address[]>(`${root}/addresses/`);
  return data;
}

export async function createAddress(input: AddressInput): Promise<Address> {
  const { data } = await api.post<Address>(`${root}/addresses/`, input);
  return data;
}

export async function updateAddress(id: number, patch: Partial<AddressInput>): Promise<Address> {
  const { data } = await api.patch<Address>(`${root}/addresses/${id}/`, patch);
  return data;
}

export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`${root}/addresses/${id}/`);
}

export async function setDefaultAddress(id: number): Promise<Address> {
  const { data } = await api.post<Address>(`${root}/addresses/${id}/set-default/`);
  return data;
}

// --- Design upload ---

export async function uploadDesign(file: File | Blob): Promise<DesignUploadResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<DesignUploadResult>(`${root}/designs/upload/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// --- Checkout & Orders ---

export async function checkout(address_id: number, notes?: string): Promise<Order> {
  const { data } = await api.post<Order>(`${root}/checkout/`, { address_id, notes });
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>(`${root}/orders/`);
  return data;
}

export async function fetchOrder(id: number): Promise<Order> {
  const { data } = await api.get<Order>(`${root}/orders/${id}/`);
  return data;
}

// --- Admin ---

export async function adminFetchOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>(`${root}/admin-api/orders/`);
  return data;
}

export async function adminUpdateOrder(
  id: number,
  patch: Partial<Pick<Order, "status" | "payment_status" | "tracking_number" | "notes">>
): Promise<Order> {
  const { data } = await api.patch<Order>(`${root}/admin-api/orders/${id}/update-status/`, patch);
  return data;
}
