import { Link } from 'react-router-dom';
import { LogoWms } from '@/components/ui/images';
import { APP_NAME, APP_TAGLINE } from '@/config/appBrand';
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/config/seo';
import { PATHS } from '@/routes/paths';

const FOOTER_SECTIONS = [
  {
    title: 'Producto',
    links: [
      { label: 'Software de bodega', to: PATHS.softwareBodega },
      { label: 'Control de inventario', to: PATHS.controlInventario },
      { label: 'WMS para PYME', to: PATHS.wmsPyme },
      { label: 'Multi-empresa', to: PATHS.multiEmpresa },
      { label: 'Precios', to: PATHS.precios },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Blog', to: PATHS.blog },
      { label: 'Excel vs WMS', to: PATHS.compararExcel },
      { label: 'Demo gratis', to: PATHS.demo },
      { label: 'Contacto', to: PATHS.contacto },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Nosotros', to: PATHS.nosotros },
      { label: 'Privacidad', to: PATHS.privacidad },
      { label: 'Términos', to: PATHS.terminos },
      { label: 'Ingresar', to: PATHS.login },
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-border/60 bg-background py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <LogoWms variant="solo" className="h-7 w-auto opacity-80" alt={APP_NAME} />
              <span className="text-sm font-medium">{APP_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{APP_TAGLINE}</p>
            <p className="mt-2 text-sm">
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 hover:underline dark:text-emerald-400">
                {CONTACT_EMAIL}
              </a>
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-emerald-600 hover:underline dark:text-emerald-400"
            >
              WhatsApp
            </a>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} {APP_NAME} · Software WMS Chile · {APP_TAGLINE}
        </p>
      </div>
    </footer>
  );
}
