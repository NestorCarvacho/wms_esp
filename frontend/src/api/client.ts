import type { ApiResponse } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export function getBaseUrl(): string {
  return BASE_URL;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('wms_token');
}

export { getToken };

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem('wms_token', token);
  } else {
    localStorage.removeItem('wms_token');
  }
}

let onUnauthorized: (() => void) | null = null;

/** Registra callback para limpiar sesión cuando el API responde 401. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function parseErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.detail === 'string') return record.detail;
    if (typeof record.mensaje === 'string') return record.mensaje;
    if (Array.isArray(record.errores) && record.errores.length > 0) {
      return String(record.errores[0]);
    }
  }
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (authenticated) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { mensaje: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      onUnauthorized?.();
    }
    throw new ApiError(
      parseErrorMessage(body, `Error HTTP ${response.status}`),
      response.status,
    );
  }

  const apiBody = body as ApiResponse<T>;
  if (apiBody && typeof apiBody === 'object' && 'exito' in apiBody && !apiBody.exito) {
    throw new ApiError(apiBody.mensaje ?? 'Operación fallida', response.status);
  }

  return apiBody as ApiResponse<T>;
}

export function getTokenExpiry(token: string): Date | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    if (!decoded.exp) return null;
    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return expiry.getTime() <= Date.now();
}
