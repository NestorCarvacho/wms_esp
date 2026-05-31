import { apiRequest, getBaseUrl, setToken } from '@/api/client';
import type { HealthStatus, LoginData, Usuario } from '@/types/api';

const USER_KEY = 'wms_user';

export function getStoredUser(): Usuario | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function setStoredUser(user: Usuario | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export async function login(email: string, contrasena: string): Promise<LoginData> {
  const response = await apiRequest<LoginData>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, contrasena }),
    },
    false,
  );

  if (!response.datos) {
    throw new Error(response.mensaje || 'Login sin datos');
  }

  setToken(response.datos.acceso_token);
  setStoredUser(response.datos.usuario);
  return response.datos;
}

export function logout(): void {
  setToken(null);
  setStoredUser(null);
}

export async function healthCheck(): Promise<HealthStatus> {
  const response = await fetch(`${getBaseUrl()}/health`);
  if (!response.ok) {
    throw new Error('API no disponible');
  }
  return response.json() as Promise<HealthStatus>;
}
