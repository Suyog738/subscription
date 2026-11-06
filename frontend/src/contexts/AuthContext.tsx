import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authService } from "../services";
import type { DemoUser } from "../types";

interface AuthContextValue {
  user: DemoUser | null;
  signIn: (email: string, password: string) => Promise<DemoUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => authService.getSession());

  const signIn = useCallback(async (email: string, password: string) => {
    const signedIn = await authService.signIn(email, password);
    setUser(signedIn);
    return signedIn;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function useCurrentUser(): DemoUser {
  const { user } = useAuth();
  if (!user) throw new Error("useCurrentUser must be used on a protected route");
  return user;
}
