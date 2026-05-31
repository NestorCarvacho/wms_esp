import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks';
import { authService } from '@/api';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, tokenExpiry, isAuthenticated } = useAppSelector((state) => state.auth);

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !token || !tokenExpiry) {
    return <Navigate to="/login" replace />;
  }

  // Si el token está expirado, redirigir al login
  const expiry = new Date(tokenExpiry);
  if (authService.isTokenExpired(expiry)) {
    return <Navigate to="/login" replace />;
  }

  // Token válido, renderizar el contenido protegido
  return <>{children}</>;
};
