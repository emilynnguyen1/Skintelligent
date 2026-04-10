import { createContext, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { setUnauthorizedHandler } from "../api/client";
import { clearAuthScopedQueries, useSessionQuery } from "../api/hooks";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const sessionQuery = useSessionQuery();
  const user = sessionQuery.data ?? null;

  useEffect(() => {
    const clearAuthState = () => clearAuthScopedQueries(queryClient);
    setUnauthorizedHandler(clearAuthState);
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  useEffect(() => {
    if (!sessionQuery.isLoading && !user) {
      clearAuthScopedQueries(queryClient);
    }
  }, [queryClient, sessionQuery.isLoading, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading: sessionQuery.isLoading,
        error: sessionQuery.error,
        refetch: sessionQuery.refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
