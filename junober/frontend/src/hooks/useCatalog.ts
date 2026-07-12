import { useQuery } from "@tanstack/react-query";

import {
  fetchColors,
  fetchPrintAreas,
  fetchPrintTypes,
  fetchProduct,
  fetchProducts,
  fetchSizes,
} from "../lib/catalogApi";

const STALE = 5 * 60 * 1000;

export function useProducts() {
  return useQuery({
    queryKey: ["catalog", "products"],
    queryFn: () => fetchProducts(),
    staleTime: STALE,
  });
}

export function useProduct(slug: string | null | undefined) {
  return useQuery({
    queryKey: ["catalog", "products", slug],
    queryFn: () => fetchProduct(slug!),
    enabled: !!slug,
    staleTime: STALE,
  });
}

export function useColors() {
  return useQuery({
    queryKey: ["catalog", "colors"],
    queryFn: fetchColors,
    staleTime: STALE,
  });
}

export function useSizes() {
  return useQuery({
    queryKey: ["catalog", "sizes"],
    queryFn: fetchSizes,
    staleTime: STALE,
  });
}

export function usePrintTypes() {
  return useQuery({
    queryKey: ["catalog", "print-types"],
    queryFn: fetchPrintTypes,
    staleTime: STALE,
  });
}

export function usePrintAreas() {
  return useQuery({
    queryKey: ["catalog", "print-areas"],
    queryFn: fetchPrintAreas,
    staleTime: STALE,
  });
}
