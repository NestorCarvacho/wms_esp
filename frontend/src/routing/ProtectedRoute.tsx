import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { isTokenExpired } from '@/api/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, isAuthenticated, logout } = useAuthContext();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
