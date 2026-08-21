import { createContext, useContext, type ReactNode } from 'react';
import type { User } from '@teamflow/contracts';
import { useMeQuery } from '../api/queries';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMeQuery();
  const value: AuthContextValue = {
    user: data ?? null,
    isLoading,
    isAuthenticated: Boolean(data),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
