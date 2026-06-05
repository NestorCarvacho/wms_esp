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
import { LogoWms } from '@/components/ui/images';
import { LoginBackground } from '@/components/layout/LoginBackground';
import { PrimaryButton } from '@/components/ui/buttons';
import { Card } from '@/components/ui/cards';
import { useAuthContext } from '@/context/AuthContext';
import { PATHS } from '@/routes/paths';
import { cn } from '@/lib/utils';

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
  const rows = [
    { sku: 'SKU-1042', zona: 'A-01-03', qty: '240 UN' },
    { sku: 'SKU-2088', zona: 'B-02-01', qty: '86 KG' },
    { sku: 'SKU-3310', zona: 'REC-01', qty: '512 UN' },
  ];

  return (
    <div className="relative">
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
          <span className="ml-2 text-xs font-medium text-muted-foreground">WMS · Stock por ubicación</span>
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
    </div>
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
    <div className="relative min-h-screen text-foreground">
      <LoginBackground />

      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to={PATHS.landing} className="flex items-center gap-2 hover:opacity-90">
            <LogoWms variant="solo" className="h-8 w-auto" alt="WMS" />
            <span className="hidden text-sm font-semibold sm:inline">WMS</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <button type="button" onClick={() => scrollTo('beneficios')} className="hover:text-foreground">
              Beneficios
            </button>
            <button type="button" onClick={() => scrollTo('modulos')} className="hover:text-foreground">
              Módulos
            </button>
            <button type="button" onClick={() => scrollTo('audiencia')} className="hover:text-foreground">
              ¿Para quién?
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <Link to={PATHS.login}>
              <PrimaryButton type="button" colorVariant="success" className="gap-2">
                Ingresar al sistema
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero — estilo Flexy / Defontana */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-12 md:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Cloud className="h-3.5 w-3.5" />
                WMS 100% en la nube · Multi-empresa
              </p>
              <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
                Software WMS para empresas:{' '}
                <span className="text-emerald-600 dark:text-emerald-400">trazabilidad total</span> de tu bodega
              </h1>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                Controla cada flujo de mercadería — desde el ingreso hasta el despacho — con visibilidad en
                tiempo real, escaneo en piso y permisos por rol. Más allá del inventario contable: quién hizo
                qué, cuándo y dónde.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={PATHS.login}>
                  <PrimaryButton type="button" colorVariant="success" className="gap-2 px-6">
                    Ingresar al sistema
                    <ArrowRight className="h-4 w-4" />
                  </PrimaryButton>
                </Link>
                <PrimaryButton type="button" variant="outline" onClick={() => scrollTo('ofrecemos')}>
                  Conocer la plataforma
                </PrimaryButton>
              </div>
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
            </div>
            <DashboardMock />
          </div>
        </section>

        {/* Stats — inspirado en Flexy "Nuestra evolución" */}
        <section className="border-y border-border/60 bg-emerald-950 text-emerald-50 dark:bg-emerald-950/90">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold md:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-emerald-200/80">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios — tira Flexy */}
        <section id="beneficios" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Simplifica y convierte tu logística en resultados
              </h2>
              <p className="mt-3 text-muted-foreground">
                Todo lo que un operador moderno necesita para ganar control, velocidad y confianza en piso.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <Card
                  key={title}
                  elevation={1}
                  padding="20px"
                  className="border-border/60 bg-card/95 text-center transition-transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="mx-auto mb-3 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Qué ofrecemos — bloque narrativo Flexy */}
        <section id="ofrecemos" className="border-t border-border/60 bg-muted/30 py-16 dark:bg-muted/10 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">¿Qué ofrecemos?</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  WMS Multi-Tenant es una plataforma de inventario operativo en la nube, diseñada para
                  operaciones que necesitan escalar sin perder control. Integra catálogo, bodegas, recepción,
                  traslado, despacho y reportería en un solo flujo — sin sistemas desconectados ni procesos
                  manuales.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Pensado para demos, pilotos y despliegue productivo: permisos por página, empresa maestra y
                  visibilidad para administradores y operadores de piso.
                </p>
                <Link to={PATHS.login} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
                  Probar la plataforma
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
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
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-3 py-2.5 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Módulos — secciones alternadas estilo Defontana */}
        <section id="modulos" className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Módulos que cubren toda la operación
              </h2>
              <p className="mt-3 text-muted-foreground">
                Desde el catálogo hasta los reportes: cada proceso con trazabilidad y control.
              </p>
            </div>
            <div className="space-y-20">
              {MODULES.map((mod, index) => {
                const reversed = index % 2 === 1;
                return (
                  <div
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
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Para quién — Flexy */}
        <section id="audiencia" className="border-t border-border/60 bg-muted/30 py-16 dark:bg-muted/10 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">¿Para quién es WMS?</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Operaciones que necesitan visibilidad real, no solo saldos contables.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <Card
                  key={title}
                  elevation={1}
                  padding="24px"
                  className="border-border/60 bg-card/95 transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ventajas — grid Flexy */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
              Ventajas de usar nuestra plataforma
            </h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ADVANTAGES.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border/60 bg-card/80 p-6 transition-colors hover:border-emerald-500/30"
                >
                  <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final — Defontana */}
        <section className="border-t border-border/60 bg-gradient-to-br from-emerald-700 to-emerald-900 py-16 text-white md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">¿Listo para tomar el control de tu bodega?</h2>
            <p className="mx-auto mt-4 max-w-lg text-emerald-100/90">
              Sin migraciones traumáticas. Accede con tu cuenta o solicita una demo a tu administrador WMS.
              Visibilidad total desde el primer día.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={PATHS.login}>
                <PrimaryButton
                  type="button"
                  className="gap-2 bg-white text-emerald-800 hover:bg-emerald-50"
                >
                  Ingresar al sistema
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
              </Link>
              <a href="mailto:contacto@wms.com">
                <PrimaryButton
                  type="button"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Solicitar información
                </PrimaryButton>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-background py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <LogoWms variant="solo" className="h-7 w-auto opacity-80" alt="WMS" />
              <span className="text-sm font-medium">WMS Multi-Tenant</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <button type="button" onClick={() => scrollTo('beneficios')} className="hover:text-foreground">
                Beneficios
              </button>
              <button type="button" onClick={() => scrollTo('modulos')} className="hover:text-foreground">
                Módulos
              </button>
              <a href="mailto:contacto@wms.com" className="hover:text-foreground hover:underline">
                contacto@wms.com
              </a>
              <Link to={PATHS.login} className="hover:text-foreground hover:underline">
                Ingresar
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} WMS Multi-Tenant · Plataforma de inventario operativo en la nube
          </p>
        </div>
      </footer>
    </div>
  );
}
