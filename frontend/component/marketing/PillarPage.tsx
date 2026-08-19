import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/buttons';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import type { SeoMeta } from '@/config/seo';
import { PATHS } from '@/routes/paths';

interface PillarPageProps {
  meta: SeoMeta;
  eyebrow: string;
  title: string;
  subtitle: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
}

export function PillarPage({ meta, eyebrow, title, subtitle, sections }: PillarPageProps) {
  return (
    <MarketingLayout meta={meta}>
      <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={PATHS.demo}>
            <PrimaryButton type="button" colorVariant="success" className="gap-2">
              Agendar demo gratis
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </Link>
          <Link to={PATHS.precios}>
            <PrimaryButton type="button" variant="outline">
              Ver precios
            </PrimaryButton>
          </Link>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20 py-16 dark:bg-muted/10">
        <div className="mx-auto max-w-3xl space-y-12 px-4">
          {sections.map((section) => (
            <article key={section.heading}>
              <h2 className="text-xl font-bold md:text-2xl">{section.heading}</h2>
              {section.paragraphs?.map((p) => (
                <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold">¿Listo para digitalizar tu bodega?</h2>
          <p className="mt-3 text-muted-foreground">
            Planes desde CLP 29.900/mes con oferta fundadores. Implementación en días.
          </p>
          <Link to={PATHS.contacto} className="mt-6 inline-block">
            <PrimaryButton type="button" colorVariant="success">
              Contactar a ventas
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
