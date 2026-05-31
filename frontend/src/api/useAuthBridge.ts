import { useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { buildWmsMenu } from '@/api/menuConfig';

export function useAuth() {
  const ctx = useAuthContext();
  const user = ctx.user
    ? {
        ...ctx.user,
        nombres: ctx.user.email.split('@')[0],
        apellidoPaterno: '',
      }
    : null;

  return {
    user,
    token: ctx.token,
    isAuthenticated: ctx.isAuthenticated,
    isSuperAdmin: ctx.isSuperAdmin,
    login: ctx.login,
    logout: ctx.logout,
  };
}

export function useMenu() {
  const { isSuperAdmin } = useAuthContext();
  return useMemo(() => buildWmsMenu(isSuperAdmin), [isSuperAdmin]);
}
