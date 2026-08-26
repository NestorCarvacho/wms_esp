import { APP_NAME, APP_TAGLINE } from '@/config/appBrand';

export const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://kheprisoftware.com';
export const CONTACT_EMAILS = [
  'nestor.carvacho@gmail.com',
  'dey.henriquez@duocuc.cl',
  'gar.villegas@duocuc.cl',
] as const;
export const CONTACT_EMAIL = CONTACT_EMAILS[0];
export const CONTACT_MAILTO = CONTACT_EMAILS.join(',');

export interface SeoMeta {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

const DEFAULT_KEYWORDS =
  'software wms chile, gestión bodega, control inventario, wms pyme, software almacén, khepri software';

export const SEO_ROUTES: Record<string, SeoMeta> = {
  '/': {
    path: '/',
    title: `Software WMS Chile | Gestión de Bodega e Inventario en la Nube — ${APP_NAME}`,
    description:
      'Control de inventario por ubicación con recepción, traslado y despacho. WMS en la nube para PYME desde CLP 29.900/mes. Demo gratis.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/precios': {
    path: '/precios',
    title: `Precios WMS | Planes desde CLP 29.900/mes — ${APP_NAME}`,
    description:
      'Planes Starter, Business y Pro para gestión de bodega. Oferta fundadores: el WMS más accesible para PYME en Chile. Sin permanencia.',
    keywords: 'precio software bodega, wms barato chile, planes wms pyme',
  },
  '/contacto': {
    path: '/contacto',
    title: `Contacto y Demo | ${APP_NAME}`,
    description:
      'Agenda una demo gratuita de Khepri WMS. Software de gestión de bodega en la nube para tu empresa en Chile.',
    keywords: 'demo wms chile, cotizar software bodega',
  },
  '/demo': {
    path: '/demo',
    title: `Demo Gratis | ${APP_NAME} WMS`,
    description: 'Solicita una demostración gratuita del software WMS Khepri. Implementación en días, no meses.',
    keywords: 'demo wms, prueba software bodega',
  },
  '/software-bodega': {
    path: '/software-bodega',
    title: `Software de Gestión de Bodega para PYME — ${APP_NAME}`,
    description:
      'Software de gestión de bodega en la nube: catálogo, ubicaciones, recepción, traslado y despacho con trazabilidad por SKU.',
    keywords: 'software gestión bodega chile, sistema gestión almacén',
  },
  '/control-inventario': {
    path: '/control-inventario',
    title: `Control de Inventario de Bodega por Ubicación — ${APP_NAME}`,
    description:
      'Control de inventario por zona y ubicación. Stock en tiempo real, historial auditado y exportaciones Excel/PDF.',
    keywords: 'control inventario bodega, stock por ubicación, trazabilidad almacén',
  },
  '/wms-pyme': {
    path: '/wms-pyme',
    title: `WMS para PYME en Chile | Simple y Accesible — ${APP_NAME}`,
    description:
      'WMS para pequeñas y medianas empresas: implementación rápida, precio fundadores desde CLP 29.900/mes y sin infraestructura local.',
    keywords: 'wms pyme chile, software bodega pequeña empresa',
  },
  '/multi-empresa': {
    path: '/multi-empresa',
    title: `WMS Multi-Empresa para Operadores Logísticos — ${APP_NAME}`,
    description:
      'Gestiona varias empresas en una sola plataforma WMS. Multi-tenant nativo con permisos granulares por razón social.',
    keywords: 'wms multi empresa, software logística multi tenant chile',
  },
  '/comparar/excel': {
    path: '/comparar/excel',
    title: `Excel vs Software de Inventario de Bodega — ${APP_NAME}`,
    description:
      'Comparativa práctica: cuándo dejar Excel y migrar a un WMS. Errores comunes, costos ocultos y checklist de decisión.',
    keywords: 'excel vs wms, alternativa excel inventario bodega',
  },
  '/nosotros': {
    path: '/nosotros',
    title: `Nosotros | ${APP_NAME} — ${APP_TAGLINE}`,
    description:
      'Conoce a Khepri Software: WMS chileno en la nube enfocado en PYME, operadores logísticos y control operativo de bodega.',
    keywords: 'khepri software, empresa wms chile',
  },
  '/privacidad': {
    path: '/privacidad',
    title: `Política de Privacidad — ${APP_NAME}`,
    description: 'Política de privacidad y tratamiento de datos de Khepri Software WMS.',
    noindex: true,
  },
  '/terminos': {
    path: '/terminos',
    title: `Términos de Servicio — ${APP_NAME}`,
    description: 'Términos y condiciones de uso del software WMS Khepri Software.',
    noindex: true,
  },
  '/blog': {
    path: '/blog',
    title: `Blog WMS e Inventario | ${APP_NAME}`,
    description:
      'Guías sobre gestión de bodega, control de inventario, trazabilidad y mejores prácticas para PYME en Chile.',
    keywords: 'blog wms, guías inventario bodega',
  },
  '/login': {
    path: '/login',
    title: `Iniciar sesión — ${APP_NAME}`,
    description: `Accede a tu cuenta de ${APP_NAME} WMS.`,
    noindex: true,
  },
};

export const PRERENDER_ROUTES = Object.keys(SEO_ROUTES).filter(
  (path) => !SEO_ROUTES[path]?.noindex && !path.startsWith('/blog/'),
);

export const SITEMAP_PATHS = [
  ...PRERENDER_ROUTES,
  '/blog/que-es-un-wms',
  '/blog/excel-vs-software-inventario',
  '/blog/stock-por-ubicacion',
  '/blog/errores-inventario-distribucion',
  '/blog/trazabilidad-bodega',
  '/blog/como-elegir-wms-pyme',
];

export function canonicalUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, '')}${normalized === '/' ? '' : normalized}`;
}

export function getSeoForPath(path: string): SeoMeta {
  const normalized = path.replace(/\/$/, '') || '/';
  if (SEO_ROUTES[normalized]) return SEO_ROUTES[normalized];
  if (normalized.startsWith('/blog/')) {
    return {
      path: normalized,
      title: `Blog — ${APP_NAME}`,
      description: 'Artículo sobre gestión de bodega e inventario operativo.',
      ogType: 'article',
    };
  }
  return SEO_ROUTES['/'];
}
