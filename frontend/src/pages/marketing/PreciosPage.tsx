import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FoundingOfferBanner, PricingCards } from '@/components/marketing/PricingCards';
import { Stagger, StaggerItem } from '@/components/marketing/motion';
import { PRICING_EXTRAS, formatClp } from '@/config/pricing';
import { SEO_ROUTES } from '@/config/seo';
import { MARKETING_FAQ } from '@/content/faq';
import { PATHS } from '@/routes/paths';

export function PreciosPage() {
  return (
    <MarketingLayout meta={SEO_ROUTES['/precios']}>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Precios transparentes
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Planes de software WMS desde CLP 29.900/mes
          </h1>
          <p className="mt-5 text-muted-foreground">
            El WMS más accesible para PYME en Chile. Oferta fundadores para los primeros clientes — sin
            permanencia mínima.
          </p>
          <div className="mt-6">
            <FoundingOfferBanner />
          </div>
        </div>

        <div className="mt-12">
          <PricingCards />
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-center text-lg font-semibold">Extras opcionales</h2>
          <Stagger className="mt-4 space-y-2" stagger="tight">
            {PRICING_EXTRAS.map((extra) => (
              <StaggerItem key={extra.label}>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 text-sm">
                  <span>{extra.label}</span>
                  <span className="font-semibold">
                    {formatClp(extra.price)}
                    {extra.unit}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
          Precios en CLP + IVA. Valores referenciales oferta fundadores 2026.{' '}
          <Link to={PATHS.contacto} className="text-emerald-600 hover:underline dark:text-emerald-400">
            Cotización personalizada
          </Link>
        </p>
      </section>

      <FaqSection title="Preguntas sobre precios" items={MARKETING_FAQ.slice(1, 5)} />
    </MarketingLayout>
  );
}
