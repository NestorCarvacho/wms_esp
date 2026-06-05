import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { appPath } from '@/routes/paths';

interface PermissionRouteProps {
  permission: string;
  children: React.ReactNode;
}

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  const { tienePermiso } = usePermissions();

  if (!tienePermiso(permission)) {
    return <Navigate to={appPath()} replace />;
  }

  return <>{children}</>;
}
