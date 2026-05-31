import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getStoredUser, login as apiLogin, logout as apiLogout, setStoredUser } from '@/api/auth';
import { isTokenExpired, setToken, setUnauthorizedHandler } from '@/api/client';
import { obtenerUsuario } from '@/api/usuarios';
import type { Usuario } from '@/types/api';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialAuth(): { user: Usuario | null; token: string | null } {
  const token = localStorage.getItem('wms_token');
  const user = getStoredUser();
  if (token && isTokenExpired(token)) {
    apiLogout();
    return { user: null, token: null };
  }
  return { user, token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = readInitialAuth();
  const [user, setUser] = useState<Usuario | null>(initial.user);
  const [token, setAuthToken] = useState<string | null>(initial.token);

  const logout = useCallback(() => {
    apiLogout();
    setToken(null);
    setAuthToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!user?.id || user.empresa_nombre || !token) return;
    let cancelled = false;
    obtenerUsuario(user.id)
      .then((datos) => {
        if (cancelled) return;
        const enriched = {
          ...user,
          empresa_nombre: datos.empresa_nombre ?? null,
          cargo_nombre: datos.cargo_nombre ?? null,
        };
        setStoredUser(enriched);
        setUser(enriched);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, token]);

  const login = useCallback(async (email: string, contrasena: string) => {
    apiLogout();
    const data = await apiLogin(email, contrasena);
    setAuthToken(data.acceso_token);
    setUser(data.usuario);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isSuperAdmin: user?.empresa_id === 1,
      login,
      logout,
    }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}

export function useAuthContext(): AuthContextValue {
  return useAuth();
}
