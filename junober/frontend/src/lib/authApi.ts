import { api, tokenStore } from "./api";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/token/", {
    email,
    password,
  });
  tokenStore.set(data.access, data.refresh);
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/api/auth/register/", payload);
  tokenStore.set(data.access, data.refresh);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/api/auth/me/");
  return data;
}

export async function updateMe(patch: Partial<Pick<User, "first_name" | "last_name" | "phone">>): Promise<User> {
  const { data } = await api.patch<User>("/api/auth/me/", patch);
  return data;
}

export async function changePassword(current: string, next: string): Promise<void> {
  await api.post("/api/auth/password/change/", {
    current_password: current,
    new_password: next,
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post("/api/auth/password/reset/request/", { email });
}

export async function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await api.post("/api/auth/password/reset/confirm/", {
    uid,
    token,
    new_password: newPassword,
  });
}

export function logout(): void {
  tokenStore.clear();
}
