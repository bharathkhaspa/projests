import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCartItem,
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "../lib/orderApi";
import type { AddCartItemPayload } from "../lib/orderTypes";
import { useAuth } from "../store/auth";

const CART_KEY = ["orders", "cart"];

export function useCart() {
  const user = useAuth((s) => s.user);
  return useQuery({
    queryKey: CART_KEY,
    queryFn: fetchCart,
    enabled: !!user,
    staleTime: 10_000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCartItemPayload) => addCartItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      updateCartItem(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEY });
    },
  });
}
