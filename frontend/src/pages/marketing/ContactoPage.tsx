import { useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/cards';
import { CONTACT_EMAIL, SEO_ROUTES, WHATSAPP_URL } from '@/config/seo';
import { APP_NAME } from '@/config/appBrand';

interface ContactoPageProps {
  variant?: 'contacto' | 'demo';
}

export function ContactoPage({ variant = 'contacto' }: ContactoPageProps) {
  const isDemo = variant === 'demo';
  const meta = SEO_ROUTES[isDemo ? '/demo' : '/contacto'];
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nombre = String(data.get('nombre') ?? '');
    const empresa = String(data.get('empresa') ?? '');
    const mensaje = String(data.get('mensaje') ?? '');
    const subject = encodeURIComponent(isDemo ? `Demo ${APP_NAME}` : `Contacto ${APP_NAME}`);
    const body = encodeURIComponent(
      `Nombre: ${nombre}\nEmpresa: ${empresa}\n\n${mensaje}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <MarketingLayout meta={meta}>
      <section className="mx-auto max-w-4xl px-4 py-16 md:py-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {isDemo ? 'Agenda una demo gratuita' : 'Contacto comercial'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {isDemo
              ? 'Te mostramos recepción, traslado, despacho y control por ubicación en 30 minutos.'
              : 'Cuéntanos tu operación y te recomendamos el plan ideal para tu bodega.'}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <Card elevation={1} padding="24px" className="border-border/60 bg-card/95">
            <h2 className="font-semibold">Escríbenos</h2>
            {sent ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Se abrió tu cliente de correo. Si no aparece, escribe directamente a{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="nombre" className="text-sm font-medium">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="empresa" className="text-sm font-medium">
                    Empresa
                  </label>
                  <input
                    id="empresa"
                    name="empresa"
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="mensaje" className="text-sm font-medium">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    required
                    defaultValue={isDemo ? 'Quiero agendar una demo de Khepri WMS.' : ''}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <PrimaryButton type="submit" colorVariant="success" className="w-full gap-2">
                  <Mail className="h-4 w-4" />
                  Enviar por correo
                </PrimaryButton>
              </form>
            )}
          </Card>

          <div className="space-y-4">
            <Card elevation={1} padding="24px" className="border-border/60 bg-card/95">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="font-semibold">WhatsApp</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Respuesta rápida en horario laboral Chile.</p>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    Abrir chat
                  </a>
                </div>
              </div>
            </Card>
            <Card elevation={1} padding="24px" className="border-border/60 bg-card/95">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="font-semibold">Correo</h3>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-1 block text-sm text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
            </Card>
            <p className="text-xs text-muted-foreground">
              Al contactarnos aceptas nuestra política de privacidad. No compartimos tus datos con terceros.
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

export function DemoPage() {
  return <ContactoPage variant="demo" />;
}
