import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from "../lib/orderApi";
import type { AddressInput } from "../lib/orderTypes";
import { useAuth } from "../store/auth";

const KEY = ["orders", "addresses"];

export function useAddresses() {
  const user = useAuth((s) => s.user);
  return useQuery({
    queryKey: KEY,
    queryFn: fetchAddresses,
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => createAddress(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<AddressInput> }) =>
      updateAddress(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setDefaultAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
