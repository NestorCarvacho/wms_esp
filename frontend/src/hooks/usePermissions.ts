import { useMemo } from 'react';
import { decodeTokenPayload } from '@/api/client';
import { useAuthContext } from '@/context/AuthContext';

export function usePermissions() {
  const { permisos, roles } = useAuthContext();

  return useMemo(
    () => ({
      permisos,
      roles,
      tienePermiso: (codigo: string) => permisos.includes(codigo),
      tieneAlguno: (...codigos: string[]) => codigos.some((c) => permisos.includes(c)),
      tieneTodos: (...codigos: string[]) => codigos.every((c) => permisos.includes(c)),
    }),
    [permisos, roles],
  );
}

export function permisosFromToken(token: string | null): { permisos: string[]; roles: string[] } {
  if (!token) return { permisos: [], roles: [] };
  const claims = decodeTokenPayload(token);
  return {
    permisos: claims?.permisos ?? [],
    roles: claims?.roles ?? [],
  };
}
