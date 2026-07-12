import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tokenStore } from "../lib/api";
import {
  changePassword,
  confirmPasswordReset,
  fetchMe,
  login,
  logout as logoutApi,
  register,
  requestPasswordReset,
  updateMe,
  type RegisterPayload,
  type User,
} from "../lib/authApi";
import { useAuth as useAuthStore } from "../store/auth";

/** Load the current user on mount if we have a token. */
export function useBootstrapAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    let cancelled = false;
    const access = tokenStore.getAccess();
    if (!access) {
      setUser(null);
      setInitializing(false);
      return;
    }
    fetchMe()
      .then((user) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        if (!cancelled) {
          tokenStore.clear();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setUser, setInitializing]);
}

export function useMe() {
  const user = useAuthStore((s) => s.user);
  return useQuery<User>({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    enabled: !!user,
    initialData: user ?? undefined,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await login(email, password);
      const me = await fetchMe();
      return me;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const result = await register(payload);
      return result.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  return () => {
    logoutApi();
    setUser(null);
    queryClient.removeQueries({ queryKey: ["auth"] });
  };
}

export function useUpdateMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMe,
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      changePassword(current, next),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: ({
      uid,
      token,
      newPassword,
    }: {
      uid: string;
      token: string;
      newPassword: string;
    }) => confirmPasswordReset(uid, token, newPassword),
  });
}
