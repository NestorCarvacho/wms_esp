import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Barcode,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cloud,
  History,
  LayoutGrid,
  LineChart,
  Package,
  ScanLine,
  Shield,
  Store,
  Truck,
  Users,
  Warehouse,
  Zap,
} from 'lucide-react';
import { LoginBackground } from '@/components/layout/LoginBackground';
import { PrimaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/cards';
import { FaqSection } from '@/components/marketing/FaqSection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import {
  HoverLift,
  MarketingMotionRoot,
  Reveal,
  Stagger,
  StaggerItem,
  spring,
  useMotionUITheme,
} from '@/components/marketing/motion';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { motion, useReducedMotion } from 'motion/react';
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/JsonLd';
import { SeoHead } from '@/components/seo/SeoHead';
import { useAuthContext } from '@/context/AuthContext';
import { PATHS } from '@/routes/paths';
import { APP_NAME, APP_TAGLINE } from '@/config/appBrand';
import { SEO_ROUTES } from '@/config/seo';
import { MARKETING_FAQ } from '@/content/faq';
import { cn } from '@/lib/utils';
import { useLoginPanel } from '@/hooks/useLoginPanel';

const BENEFITS = [
  { icon: Zap, title: 'Información en tiempo real', text: 'Stock y movimientos actualizados al instante.' },
  { icon: LineChart, title: 'Mayor productividad', text: 'Menos errores y menos tiempo en piso.' },
  { icon: Warehouse, title: 'Optimiza tu almacén', text: 'Ubicaciones, zonas y flujos ordenados.' },
  { icon: LayoutGrid, title: 'Visibiliza tu stock', text: 'Existencias por bodega, zona y SKU.' },
  { icon: Truck, title: 'Despachos confiables', text: 'Trazabilidad desde recepción hasta salida.' },
] as const;

const STATS = [
  { value: 'Multi', label: 'Empresa' },
  { value: '100%', label: 'En la nube' },
  { value: 'RBAC', label: 'Permisos por rol' },
  { value: '24/7', label: 'Disponibilidad' },
] as const;

const AUDIENCES = [
  {
    icon: Building2,
    title: 'Operadores logísticos',
    text: 'Gestiona varias empresas y bodegas con permisos granulares y visibilidad por tenant.',
  },
  {
    icon: Store,
    title: 'Retail y distribución',
    text: 'Centros de distribución con recepción, traslado y despacho por ubicación.',
  },
  {
    icon: Package,
    title: 'E-commerce y fulfillment',
    text: 'Control de inventario operativo con escaneo y historial auditado por movimiento.',
  },
] as const;

const ADVANTAGES = [
  { icon: Cloud, title: 'Cloud', text: 'Sin instalaciones. Accede desde cualquier navegador.' },
  { icon: Shield, title: 'Multi-empresa', text: 'Varias razones sociales en una sola plataforma.' },
  { icon: ScanLine, title: 'Escaneo', text: 'Pistola, SKU manual y flujos guiados en piso.' },
  { icon: Users, title: 'Roles y permisos', text: 'Cada usuario ve solo lo que debe operar.' },
  { icon: Barcode, title: 'Trazabilidad', text: 'Quién, cuándo y dónde en cada movimiento.' },
  { icon: Zap, title: 'Implementación ágil', text: 'Catálogo, bodegas y operación en días, no meses.' },
] as const;

const MODULES = [
  {
    tag: 'Catálogo',
    title: 'Administra productos con flexibilidad',
    bullets: [
      'Alta individual de productos con SKU y unidades de medida.',
      'Tipos de producto y catálogo centralizado por empresa.',
      'Integración lista para escaneo en recepción y despacho.',
    ],
    icon: Package,
    accent: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    tag: 'Bodegas',
    title: 'Ubicaciones como base de la operación',
    bullets: [
      'Bodegas, tipos de zona y ubicaciones personalizadas.',
      'Zona de recepción configurable por almacén.',
      'Filtro por empresa para operadores multi-tenant.',
    ],
    icon: Warehouse,
    accent: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    tag: 'Recepción',
    title: 'Ingreso formal con control total',
    bullets: [
      'Órdenes de recepción con líneas escaneadas.',
      'Asignación de zona destino y cantidades por SKU.',
      'Registro automático en stock e historial de movimientos.',
    ],
    icon: ScanLine,
    accent: 'from-violet-500/20 to-purple-500/10',
  },
  {
    tag: 'Operaciones',
    title: 'Traslado y despacho en piso',
    bullets: [
      'Traslados internos entre zonas con trazabilidad.',
      'Despacho con validación de stock disponible.',
      'Flujos pensados para pistola y operación rápida.',
    ],
    icon: Truck,
    accent: 'from-amber-500/20 to-orange-500/10',
  },
  {
    tag: 'Reportes',
    title: 'Visibilidad en tiempo real',
    bullets: [
      'Stock por ubicación con búsqueda y ordenamiento.',
      'Historial de movimientos con usuario y fecha.',
      'Panel de control para supervisión operativa.',
    ],
    icon: History,
    accent: 'from-rose-500/20 to-pink-500/10',
  },
] as const;

function DashboardMock() {
  const theme = useMotionUITheme();
  const reduce = useReducedMotion();
  const rows = [
    { sku: 'SKU-1042', zona: 'A-01-03', qty: '240 UN' },
    { sku: 'SKU-2088', zona: 'B-02-01', qty: '86 KG' },
    { sku: 'SKU-3310', zona: 'REC-01', qty: '512 UN' },
  ];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: reduce ? 0 : 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...spring(theme.transitions.gentle), delay: 0.15 }}
    >
      <motion.div
        className="relative"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/15 blur-2xl" />
      <Card
        elevation={2}
        padding="0"
        className="relative overflow-hidden border-border/60 bg-card/95 shadow-2xl shadow-emerald-900/10"
      >
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs font-medium text-muted-foreground">{APP_NAME} · Stock por ubicación</span>
        </div>
        <div className="grid grid-cols-3 gap-px bg-border/40 p-px">
          {[
            { label: 'SKUs activos', value: '1.248' },
            { label: 'Bodegas', value: '12' },
            { label: 'Mov. hoy', value: '384' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-card px-4 py-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{kpi.value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 px-4 py-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Inventario operativo</span>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
              En vivo
            </span>
          </div>
          <div className="space-y-2">
            {rows.map((row) => (
              <div
                key={row.sku}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs"
              >
                <span className="font-medium">{row.sku}</span>
                <span className="text-muted-foreground">{row.zona}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      </motion.div>
    </motion.div>
  );
}

function ModuleVisual({ icon: Icon, accent }: { icon: typeof Package; accent: string }) {
  return (
    <div
      className={cn(
        'flex aspect-[4/3] items-center justify-center rounded-2xl border border-border/60 bg-gradient-to-br p-8',
        accent,
      )}
    >
      <div className="rounded-2xl border border-border/50 bg-card/90 p-6 shadow-lg">
        <Icon className="h-16 w-16 text-emerald-600 dark:text-emerald-400" strokeWidth={1.25} />
      </div>
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated } = useAuthContext();
  const openLoginPanel = useLoginPanel();

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark');
    return () => {
      if (wasDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to={PATHS.app} replace />;
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <MarketingMotionRoot>
    <div className="relative min-h-screen text-foreground">
      <SeoHead meta={SEO_ROUTES['/']} />
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <LoginBackground />

      <MarketingHeader />

      <main className="relative z-10">
        {/* Hero — editorial stagger (Motion UI) */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 md:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Stagger mode="mount" stagger="base">
              <StaggerItem>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Cloud className="h-3.5 w-3.5" />
                  {APP_NAME} · {APP_TAGLINE}
                </p>
              </StaggerItem>
              <StaggerItem>
                <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
                  Software de gestión de bodega e{' '}
                  <span className="text-emerald-600 dark:text-emerald-400">inventario en la nube</span>
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                  WMS para PYME en Chile: controla cada flujo de mercadería — recepción, traslado y despacho —
                  con stock por ubicación, escaneo en piso y trazabilidad por rol. Más allá del inventario
                  contable: quién hizo qué, cuándo y dónde.
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={PATHS.demo}>
                    <PrimaryButton type="button" colorVariant="success" className="gap-2 px-6">
                      Demo gratis
                      <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                  </Link>
                  <Link to={PATHS.precios}>
                    <PrimaryButton type="button" variant="outline">
                      Ver precios desde CLP 29.900
                    </PrimaryButton>
                  </Link>
                  <PrimaryButton type="button" variant="outline" onClick={() => scrollTo('ofrecemos')}>
                    Conocer la plataforma
                  </PrimaryButton>
                </div>
              </StaggerItem>
              <StaggerItem>
                <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                  {['Sin instalaciones complejas', 'Multi-tenant listo', 'Escaneo y pistola', 'Historial auditado'].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </StaggerItem>
            </Stagger>
            <DashboardMock />
          </div>
        </section>

        {/* Stats — inspirado en Flexy "Nuestra evolución" */}
        <section className="border-y border-border/60 bg-emerald-950 text-emerald-50 dark:bg-emerald-950/90">
          <Stagger className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4" stagger="tight">
            {STATS.map(({ value, label }) => (
              <StaggerItem key={label}>
                <div className="text-center">
                  <p className="text-2xl font-bold md:text-3xl">{value}</p>
                  <p className="mt-1 text-sm text-emerald-200/80">{label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* Beneficios — tira Flexy */}
        <section id="beneficios" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Simplifica y convierte tu logística en resultados
              </h2>
              <p className="mt-3 text-muted-foreground">
                Todo lo que un operador moderno necesita para ganar control, velocidad y confianza en piso.
              </p>
            </Reveal>
            <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" stagger="tight">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <StaggerItem key={title}>
                  <HoverLift>
                    <Card
                      elevation={1}
                      padding="20px"
                      className="border-border/60 bg-card/95 text-center"
                    >
                      <div className="mx-auto mb-3 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Qué ofrecemos — bloque narrativo Flexy */}
        <section id="ofrecemos" className="border-t border-border/60 bg-muted/30 py-16 dark:bg-muted/10 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">¿Qué ofrecemos?</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {APP_NAME} es una plataforma de inventario operativo en la nube, diseñada para
                  operaciones que necesitan escalar sin perder control. Integra catálogo, bodegas, recepción,
                  traslado, despacho y reportería en un solo flujo — sin sistemas desconectados ni procesos
                  manuales.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Pensado para demos, pilotos y despliegue productivo: permisos por página, empresa maestra y
                  visibilidad para administradores y operadores de piso.
                </p>
                <button
                  type="button"
                  onClick={openLoginPanel}
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Probar la plataforma
                  <ChevronRight className="h-4 w-4" />
                </button>
              </Reveal>
              <Stagger className="grid gap-3 sm:grid-cols-2" stagger="tight">
                {[
                  'Software 100% en la nube',
                  'Multi-empresa sin fricción',
                  'Escaneo y pistola en piso',
                  'Roles y permisos granulares',
                  'Stock por ubicación',
                  'Historial auditado',
                  'Panel de control',
                  'Listo para Railway',
                ].map((item) => (
                  <StaggerItem key={item}>
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-3 py-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      {item}
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* Módulos — secciones alternadas estilo Defontana */}
        <section id="modulos" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Módulos que cubren toda la operación
              </h2>
              <p className="mt-3 text-muted-foreground">
                Desde el catálogo hasta los reportes: cada proceso con trazabilidad y control.
              </p>
            </Reveal>
            <div className="space-y-20">
              {MODULES.map((mod, index) => {
                const reversed = index % 2 === 1;
                return (
                  <Reveal
                    key={mod.tag}
                    className={cn(
                      'grid items-center gap-10 lg:grid-cols-2',
                      reversed && 'lg:[&>*:first-child]:order-2',
                    )}
                  >
                    <div>
                      <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        {mod.tag}
                      </span>
                      <h3 className="mt-4 text-xl font-bold md:text-2xl">{mod.title}</h3>
                      <ul className="mt-6 space-y-3">
                        {mod.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <ModuleVisual icon={mod.icon} accent={mod.accent} />
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Para quién — Flexy */}
        <section id="audiencia" className="border-t border-border/60 bg-muted/30 py-16 dark:bg-muted/10 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">¿Para quién es {APP_NAME}?</h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
                Operaciones que necesitan visibilidad real, no solo saldos contables.
              </p>
            </Reveal>
            <Stagger className="mt-12 grid gap-6 md:grid-cols-3" stagger="base">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <StaggerItem key={title}>
                  <HoverLift>
                    <Card
                      elevation={1}
                      padding="24px"
                      className="border-border/60 bg-card/95"
                    >
                      <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Ventajas — grid Flexy */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                Ventajas de usar nuestra plataforma
              </h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger="tight">
              {ADVANTAGES.map(({ icon: Icon, title, text }) => (
                <StaggerItem key={title}>
                  <HoverLift>
                    <div className="rounded-xl border border-border/60 bg-card/80 p-6 transition-colors hover:border-emerald-500/30">
                      <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                      <h3 className="mt-4 font-semibold">{title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                    </div>
                  </HoverLift>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <TestimonialsSection />

        <FaqSection items={MARKETING_FAQ} />

        {/* CTA final — Defontana */}
        <section className="border-t border-border/60 bg-gradient-to-br from-emerald-700 to-emerald-900 py-16 text-white md:py-20">
          <Reveal className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">¿Listo para tomar el control de tu bodega?</h2>
            <p className="mx-auto mt-4 max-w-lg text-emerald-100/90">
              Sin migraciones traumáticas. Accede con tu cuenta o solicita una demo a tu administrador de {APP_NAME}.
              Visibilidad total desde el primer día.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={PATHS.demo}>
                <PrimaryButton
                  type="button"
                  className="gap-2 bg-white text-emerald-800 hover:bg-emerald-50"
                >
                  Agendar demo gratis
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </Link>
              <Link to={PATHS.precios}>
                <PrimaryButton
                  type="button"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Ver planes y precios
                </PrimaryButton>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <MarketingFooter />
    </div>
    </MarketingMotionRoot>
  );
}
