import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { tokenStorage } from '@/auth/tokenStorage';
import { registerSessionExpiredHandler } from '@/api/client';
import { authApi } from '@/api/endpoints/auth';
import type { UserDto } from '@/types/api';

interface AuthContextValue {
  isBootstrapping: boolean;
  user: UserDto | null;
  isAuthenticated: boolean;
  /** Set after tokens are issued, used to hydrate `user` and refresh it elsewhere. */
  setSession: (accessToken: string, refreshToken: string, user: UserDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);

  const setSession = useCallback(async (accessToken: string, refreshToken: string, u: UserDto) => {
    await tokenStorage.setTokens(accessToken, refreshToken);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // best-effort — clear local session regardless of server response
    }
    await tokenStorage.clear();
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
  }, []);

  // On app launch: if we have a stored access token, try to hydrate the user.
  // The axios interceptor will transparently refresh it if it's expired.
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        if (accessToken) {
          const me = await authApi.me();
          setUser(me);
        }
      } catch {
        await tokenStorage.clear();
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  // Wired to the axios client: if a refresh ever fails outright (revoked/expired/stolen),
  // force the app back to the login screen.
  useEffect(() => {
    registerSessionExpiredHandler(() => setUser(null));
  }, []);

  const value = useMemo(
    () => ({
      isBootstrapping,
      user,
      isAuthenticated: !!user,
      setSession,
      logout,
      refreshMe,
    }),
    [isBootstrapping, user, setSession, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
