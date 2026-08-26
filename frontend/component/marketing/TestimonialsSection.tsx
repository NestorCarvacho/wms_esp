import { Quote } from 'lucide-react';
import { Card } from '@/components/ui/cards';
import { HoverLift, Reveal, Stagger, StaggerItem } from './motion';

const TESTIMONIALS = [
  {
    quote:
      'Pasamos de reconciliar Excel cada viernes a ver el stock por ubicación en tiempo real. La recepción con escaneo nos ahorró horas.',
    name: 'Jefe de bodega',
    company: 'Distribuidora regional — piloto Khepri',
  },
  {
    quote:
      'Lo que más valoramos es la trazabilidad: sabemos quién despachó cada pedido. Para auditorías internas es oro.',
    name: 'Gerente de operaciones',
    company: 'Operador logístico multi-empresa',
  },
  {
    quote:
      'Implementamos en menos de una semana. El precio fundadores nos permitió probar sin el riesgo de un WMS enterprise.',
    name: 'Administrador',
    company: 'PYME retail — plan Business',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
            Lo que dicen nuestros clientes fundadores
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Empresas que digitalizaron su bodega con Khepri Software.
          </p>
        </Reveal>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3" stagger="base">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <HoverLift>
                <Card elevation={1} padding="24px" className="border-border/60 bg-card/95">
                  <Quote className="h-8 w-8 text-emerald-600/40 dark:text-emerald-400/40" />
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.company}</p>
                </Card>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
