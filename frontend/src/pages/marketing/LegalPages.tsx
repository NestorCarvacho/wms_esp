import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { Reveal } from '@/components/marketing/motion';
import { Card } from '@/components/ui/cards';
import { SEO_ROUTES, CONTACT_EMAILS } from '@/config/seo';
import { APP_NAME, APP_TAGLINE } from '@/config/appBrand';
import { PATHS } from '@/routes/paths';

export function NosotrosPage() {
  return (
    <MarketingLayout meta={SEO_ROUTES['/nosotros']}>
      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Sobre {APP_NAME}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{APP_TAGLINE}</p>

        <div className="mt-10 space-y-6 leading-relaxed text-muted-foreground">
          <p>
            {APP_NAME} nace para democratizar la gestión de bodega en Chile y Latinoamérica. Vimos PYME y
            operadores logísticos atrapados entre Excel y WMS enterprise inaccesibles — y construimos una
            alternativa en la nube, operativa desde el primer día.
          </p>
          <p>
            Nuestro foco es el <strong className="text-foreground">inventario operativo</strong>: recepción,
            traslado, despacho y stock por ubicación con trazabilidad real. Multi-empresa nativo para quienes
            gestionan varios clientes en una sola plataforma.
          </p>
          <h2 className="text-xl font-bold text-foreground">Misión</h2>
          <p>
            Dar a cada bodega — grande o pequeña — las herramientas de un operador moderno: visibilidad,
            control y confianza en piso, sin proyectos de implementación interminables.
          </p>
          <h2 className="text-xl font-bold text-foreground">Valores</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Simplicidad operativa sobre funciones que no se usan</li>
            <li>Precio transparente y accesible para PYME</li>
            <li>Seguridad multi-tenant y permisos granulares</li>
            <li>Soporte en español, pensado para Chile</li>
          </ul>
        </div>

        <Reveal>
          <Card elevation={1} padding="24px" className="mt-12 border-border/60">
            <h2 className="font-semibold">¿Hablamos?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Estamos incorporando clientes fundadores con precio especial.
            </p>
            <Link
              to={PATHS.demo}
              className="mt-4 inline-block text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Agendar demo →
            </Link>
          </Card>
        </Reveal>
      </section>
    </MarketingLayout>
  );
}

export function PrivacidadPage() {
  return (
    <MarketingLayout meta={SEO_ROUTES['/privacidad']} forceDark={false}>
      <article className="mx-auto max-w-3xl px-4 py-16 prose prose-sm dark:prose-invert">
        <h1>Política de privacidad</h1>
        <p className="text-muted-foreground">Última actualización: agosto 2026</p>
        <section className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            {APP_NAME} (&quot;nosotros&quot;) trata los datos personales que nos proporcionas al registrarte,
            contactarnos o usar el servicio WMS, conforme a la legislación chilena aplicable.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Datos que recopilamos</h2>
          <p>Nombre, correo electrónico, empresa, teléfono y datos de uso del sistema necesarios para operar tu cuenta.</p>
          <h2 className="text-lg font-semibold text-foreground">Uso de los datos</h2>
          <p>Prestación del servicio, soporte, seguridad, facturación y mejora del producto. No vendemos tus datos.</p>
          <h2 className="text-lg font-semibold text-foreground">Almacenamiento</h2>
          <p>Los datos se alojan en infraestructura en la nube con medidas de seguridad y aislamiento por empresa (multi-tenant).</p>
          <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
          <p>
            Para ejercer derechos de acceso, rectificación o eliminación:{' '}
            {CONTACT_EMAILS.map((email, index) => (
              <span key={email}>
                {index > 0 ? ', ' : ''}
                <a href={`mailto:${email}`} className="text-emerald-600">
                  {email}
                </a>
              </span>
            ))}
            .
          </p>
        </section>
      </article>
    </MarketingLayout>
  );
}

export function TerminosPage() {
  return (
    <MarketingLayout meta={SEO_ROUTES['/terminos']} forceDark={false}>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold">Términos de servicio</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última actualización: agosto 2026</p>
        <section className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Al usar {APP_NAME} WMS aceptas estos términos. El servicio se provee en modalidad SaaS bajo
            suscripción según el plan contratado.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Uso del servicio</h2>
          <p>
            Eres responsable de las credenciales de tu organización y del uso conforme a la ley. Nos reservamos
            el derecho de suspender cuentas por uso abusivo o impago.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Disponibilidad</h2>
          <p>
            Buscamos alta disponibilidad pero no garantizamos interrupción cero. Mantenimientos programados se
            comunicarán con anticipación razonable.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Propiedad de los datos</h2>
          <p>Los datos de inventario y catálogo son de tu empresa. Puedes exportarlos según las funciones del sistema.</p>
          <h2 className="text-lg font-semibold text-foreground">Contacto</h2>
          <p>
            {CONTACT_EMAILS.map((email, index) => (
              <span key={email}>
                {index > 0 ? ', ' : ''}
                <a href={`mailto:${email}`} className="text-emerald-600">
                  {email}
                </a>
              </span>
            ))}
          </p>
        </section>
      </article>
    </MarketingLayout>
  );
}
