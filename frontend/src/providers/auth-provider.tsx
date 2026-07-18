"use client";

import * as React from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { authService } from "@/features/auth/services/auth-service";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSession, clearSession, setLoading } = useAuthStore();

  React.useEffect(() => {
    async function initializeSession() {
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("auth_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token) {
        clearSession();
        return;
      }

      try {
        // Hydrate profile data from auth service
        const response = await authService.getProfile();
        if (response.success && refreshToken) {
          setSession(response.data, token, refreshToken);
        } else {
          clearSession();
        }
      } catch (error) {
        const err = error as Record<string, unknown> | null;
        // If JWT token expired, trigger silent token rotation
        if (err?.status === 401 && refreshToken) {
          try {
            const refreshResponse = await authService.refreshToken(refreshToken);
            if (refreshResponse.success) {
              const nextTokens = refreshResponse.data;

              // Temporarily store next token for the profile query
              localStorage.setItem("auth_token", nextTokens.token);

              const profileResponse = await authService.getProfile();
              if (profileResponse.success) {
                setSession(profileResponse.data, nextTokens.token, nextTokens.refreshToken);
                return;
              }
            }
          } catch (refreshError) {
            console.error("[AuthProvider] Silent token rotation failed:", refreshError);
          }
        }

        console.error("[AuthProvider] Session validation error, purging credentials:", error);
        clearSession();
      }
    }

    initializeSession();
  }, [setSession, clearSession, setLoading]);

  return <>{children}</>;
}
export type { AuthProviderProps };
