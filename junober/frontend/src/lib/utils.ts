const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

/** Convert a relative media path from Django to an absolute URL. */
export function imgUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE}/${path.replace(/^\/+/, "")}`;
}

/** Format a decimal/string price to ₹ with 2 decimal places. */
export function fmtPrice(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === "") return "₹0.00";
  return `₹${Number(val).toFixed(2)}`;
}

/** Format price as whole number (no paise) when cents = .00 */
export function fmtPriceShort(val: string | number | null | undefined): string {
  const n = Number(val ?? 0);
  return `₹${n % 1 === 0 ? n : n.toFixed(2)}`;
}
