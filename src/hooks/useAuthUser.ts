import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthState | null>(null);

export const useAuthUser = (): AuthState => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthUser must be used within an AuthProvider");
  }

  return context;
};
