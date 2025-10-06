import React, { createContext, useContext, useEffect, useState } from "react";

import api from "../lib/api";
import type { User } from "../types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const p = await api.profile();
      setUser({ ID: p.id, username: p.username, avatar: p.avatar });
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    // on mount try to load profile if token exists
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function login(email: string, passwordShaHex: string) {
    await api.login(email, passwordShaHex);
    await refresh();
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
