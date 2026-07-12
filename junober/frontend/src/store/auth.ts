import { create } from "zustand";
import type { User } from "../lib/authApi";

interface AuthState {
  user: User | null;
  isInitializing: boolean;
  setUser: (u: User | null) => void;
  setInitializing: (v: boolean) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isInitializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
