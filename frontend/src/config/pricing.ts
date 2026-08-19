export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  priceMonthlyRegular: number;
  highlighted?: boolean;
  badge?: string;
  features: string[];
  limits: {
    bodegas: string;
    usuarios: string;
    skus: string;
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Primera bodega digitalizada sin fricción.',
    priceMonthly: 29900,
    priceAnnual: 299000,
    priceMonthlyRegular: 69000,
    features: [
      'Recepción, traslado y despacho',
      'Stock por ubicación',
      'Exportaciones Excel y PDF',
      'Roles y permisos básicos',
      'Soporte por email (72 h)',
    ],
    limits: { bodegas: '1', usuarios: '3', skus: '1.000' },
  },
  {
    id: 'business',
    name: 'Business',
    description: 'El plan recomendado para PYME en crecimiento.',
    priceMonthly: 59900,
    priceAnnual: 599000,
    priceMonthlyRegular: 149000,
    highlighted: true,
    badge: 'Más popular',
    features: [
      'Todo lo de Starter',
      'Multi-zona y permisos avanzados',
      'Onboarding remoto 2 h (anual)',
      'Soporte prioritario (24 h)',
      'Historial auditado completo',
    ],
    limits: { bodegas: '2', usuarios: '8', skus: '5.000' },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Multi-sitio y operadores con varias empresas.',
    priceMonthly: 99900,
    priceAnnual: 999000,
    priceMonthlyRegular: 299000,
    features: [
      'Todo lo de Business',
      'Multi-empresa nativo',
      'Hasta 20 usuarios incluidos',
      'Soporte prioritario + SLA básico',
      'Prioridad en roadmap e integraciones',
    ],
    limits: { bodegas: '5', usuarios: '20', skus: 'Ilimitados' },
  },
];

export function formatClp(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const PRICING_EXTRAS = [
  { label: 'Usuario adicional', price: 7900, unit: '/mes' },
  { label: 'Bodega adicional (Starter)', price: 19900, unit: '/mes' },
  { label: 'Migración desde Excel', price: 149000, unit: 'único' },
] as const;

export const FOUNDING_OFFER = {
  title: 'Oferta fundadores',
  subtitle: 'Primeros 20 clientes · precio bloqueado 12 meses',
  slotsRemaining: 20,
} as const;
