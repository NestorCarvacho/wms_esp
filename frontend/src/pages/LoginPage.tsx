import { Navigate } from 'react-router-dom';
import { PATHS } from '@/routes/paths';

/** Redirige al sitio público y abre el panel lateral de login. */
export function LoginPage() {
  return <Navigate to={`${PATHS.landing}?login=1`} replace />;
}
