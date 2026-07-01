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
import { decodeTokenPayload, isTokenExpired, setToken, setUnauthorizedHandler } from '@/api/client';
import { obtenerUsuario } from '@/api/usuarios';
import type { Usuario } from '@/types/api';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  permisos: string[];
  roles: string[];
  sessionKey: number;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  tienePermiso: (codigo: string) => boolean;
  login: (email: string, contrasena: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function claimsFromToken(token: string | null): { permisos: string[]; roles: string[] } {
  if (!token) return { permisos: [], roles: [] };
  const claims = decodeTokenPayload(token);
  return {
    permisos: claims?.permisos ?? [],
    roles: claims?.roles ?? [],
  };
}

function readInitialAuth(): {
  user: Usuario | null;
  token: string | null;
  permisos: string[];
  roles: string[];
} {
  const token = localStorage.getItem('wms_token');
  const user = getStoredUser();
  if (token && isTokenExpired(token)) {
    apiLogout();
    return { user: null, token: null, permisos: [], roles: [] };
  }
  const fromUser = {
    permisos: user?.permisos ?? [],
    roles: user?.roles ?? [],
  };
  const fromToken = claimsFromToken(token);
  return {
    user,
    token,
    permisos: fromUser.permisos.length ? fromUser.permisos : fromToken.permisos,
    roles: fromUser.roles.length ? fromUser.roles : fromToken.roles,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = readInitialAuth();
  const [user, setUser] = useState<Usuario | null>(initial.user);
  const [token, setAuthToken] = useState<string | null>(initial.token);
  const [permisos, setPermisos] = useState<string[]>(initial.permisos);
  const [roles, setRoles] = useState<string[]>(initial.roles);
  const [sessionKey, setSessionKey] = useState(0);

  const logout = useCallback(() => {
    apiLogout();
    setToken(null);
    setAuthToken(null);
    setUser(null);
    setPermisos([]);
    setRoles([]);
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
    const userPermisos = data.usuario.permisos ?? claimsFromToken(data.acceso_token).permisos;
    const userRoles = data.usuario.roles ?? claimsFromToken(data.acceso_token).roles;
    const enrichedUser = { ...data.usuario, permisos: userPermisos, roles: userRoles };
    setStoredUser(enrichedUser);
    setUser(enrichedUser);
    setPermisos(userPermisos);
    setRoles(userRoles);
    setSessionKey((k) => k + 1);
  }, []);

  const tienePermiso = useCallback((codigo: string) => permisos.includes(codigo), [permisos]);

  const value = useMemo(
    () => ({
      user,
      token,
      permisos,
      roles,
      sessionKey,
      isAuthenticated: Boolean(token && user),
      isSuperAdmin: Boolean(user?.es_empresa_maestra ?? user?.empresa_id === 1),
      tienePermiso,
      login,
      logout,
    }),
    [user, token, permisos, roles, sessionKey, tienePermiso, login, logout],
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
