import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/cards';
import { PrimaryButton } from '@/components/ui/buttons';
import { FOUNDING_OFFER, formatClp, PRICING_PLANS } from '@/config/pricing';
import { PATHS } from '@/routes/paths';
import { cn } from '@/lib/utils';

export function PricingCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PRICING_PLANS.map((plan) => (
        <Card
          key={plan.id}
          elevation={plan.highlighted ? 2 : 1}
          padding="24px"
          className={cn(
            'relative flex flex-col border-border/60 bg-card/95',
            plan.highlighted && 'border-emerald-500/40 ring-1 ring-emerald-500/20',
          )}
        >
          {plan.badge && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-bold text-white">
              {plan.badge}
            </span>
          )}
          <h3 className="text-lg font-bold">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

          <div className="mt-6">
            <p className="text-xs text-muted-foreground line-through">{formatClp(plan.priceMonthlyRegular)}/mes</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatClp(plan.priceMonthly)}
              <span className="text-sm font-normal text-muted-foreground">/mes</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              o {formatClp(plan.priceAnnual)}/año (2 meses gratis)
            </p>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-center text-xs">
            <div>
              <dt className="text-muted-foreground">Bodegas</dt>
              <dd className="font-semibold">{plan.limits.bodegas}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Usuarios</dt>
              <dd className="font-semibold">{plan.limits.usuarios}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">SKUs</dt>
              <dd className="font-semibold">{plan.limits.skus}</dd>
            </div>
          </dl>

          <ul className="mt-6 flex-1 space-y-2">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {f}
              </li>
            ))}
          </ul>

          <Link to={PATHS.demo} className="mt-6 block">
            <PrimaryButton
              type="button"
              colorVariant="success"
              className="w-full"
              variant={plan.highlighted ? 'primary' : 'outline'}
            >
              Solicitar {plan.name}
            </PrimaryButton>
          </Link>
        </Card>
      ))}
    </div>
  );
}

export function FoundingOfferBanner() {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm">
      <strong>{FOUNDING_OFFER.title}</strong> — {FOUNDING_OFFER.subtitle}
    </div>
  );
}
