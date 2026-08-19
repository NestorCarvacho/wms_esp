import { SeoHead } from '@/components/seo/SeoHead';
import { SEO_ROUTES } from '@/config/seo';

/** Evita indexación de rutas privadas de la aplicación. */
export function AppNoIndex() {
  return <SeoHead meta={SEO_ROUTES['/login']} />;
}
