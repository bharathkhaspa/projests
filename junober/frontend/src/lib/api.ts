import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

const ACCESS_TOKEN_KEY = "ff_access";
const REFRESH_TOKEN_KEY = "ff_refresh";

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshInflight: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${baseURL}/api/auth/token/refresh/`, { refresh });
    const access = data.access as string;
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    return access;
  } catch {
    tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      refreshInflight = refreshInflight ?? refreshAccess();
      const newAccess = await refreshInflight;
      refreshInflight = null;
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
