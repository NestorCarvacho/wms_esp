/**
 * Post-build: genera index.html por ruta con meta tags estáticos para crawlers.
 * Complementa react-helmet-async en navegación cliente.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const siteUrl = process.env.VITE_SITE_URL ?? 'https://kheprisoftware.com';

const ROUTE_META = {
  '/': {
    title: 'Software WMS Chile | Gestión de Bodega e Inventario en la Nube — Khepri Software',
    description:
      'Control de inventario por ubicación con recepción, traslado y despacho. WMS en la nube para PYME desde CLP 29.900/mes. Demo gratis.',
  },
  '/precios': {
    title: 'Precios WMS | Planes desde CLP 29.900/mes — Khepri Software',
    description: 'Planes Starter, Business y Pro. Oferta fundadores para PYME en Chile.',
  },
  '/contacto': {
    title: 'Contacto y Demo | Khepri Software',
    description: 'Agenda una demo gratuita de Khepri WMS.',
  },
  '/demo': {
    title: 'Demo Gratis | Khepri Software WMS',
    description: 'Solicita una demostración gratuita del software WMS Khepri.',
  },
  '/software-bodega': {
    title: 'Software de Gestión de Bodega para PYME — Khepri Software',
    description: 'Software de gestión de bodega en la nube con trazabilidad por SKU.',
  },
  '/control-inventario': {
    title: 'Control de Inventario de Bodega por Ubicación — Khepri Software',
    description: 'Stock por zona, historial auditado y exportaciones.',
  },
  '/wms-pyme': {
    title: 'WMS para PYME en Chile | Simple y Accesible — Khepri Software',
    description: 'WMS para PYME desde CLP 29.900/mes. Implementación en días.',
  },
  '/multi-empresa': {
    title: 'WMS Multi-Empresa para Operadores Logísticos — Khepri Software',
    description: 'Multi-tenant nativo con permisos granulares.',
  },
  '/comparar/excel': {
    title: 'Excel vs Software de Inventario de Bodega — Khepri Software',
    description: 'Cuándo migrar de Excel a un WMS.',
  },
  '/nosotros': {
    title: 'Nosotros | Khepri Software — Tu WMS a tu medida',
    description: 'WMS chileno en la nube para PYME y operadores logísticos.',
  },
  '/blog': {
    title: 'Blog WMS e Inventario | Khepri Software',
    description: 'Guías sobre gestión de bodega y control de inventario.',
  },
  '/blog/que-es-un-wms': {
    title: 'Qué es un WMS y cuándo lo necesita tu bodega — Khepri Software',
    description: 'Guía sobre sistemas de gestión de almacén para PYME.',
  },
  '/blog/excel-vs-software-inventario': {
    title: 'Excel vs software de inventario de bodega — Khepri Software',
    description: 'Comparativa práctica Excel vs WMS.',
  },
  '/blog/stock-por-ubicacion': {
    title: 'Cómo organizar stock por ubicación — Khepri Software',
    description: 'Buenas prácticas de zonas y ubicaciones en bodega.',
  },
  '/blog/errores-inventario-distribucion': {
    title: '7 errores comunes de inventario en distribución — Khepri Software',
    description: 'Fallos frecuentes y cómo un WMS los previene.',
  },
  '/blog/trazabilidad-bodega': {
    title: 'Trazabilidad en bodega — Khepri Software',
    description: 'Qué registrar en cada movimiento de inventario.',
  },
  '/blog/como-elegir-wms-pyme': {
    title: 'Cómo elegir un WMS para PYME en Chile — Khepri Software',
    description: 'Checklist de 10 criterios para evaluar software de bodega.',
  },
};

function injectMeta(html, route, meta) {
  const canonical = `${siteUrl.replace(/\/$/, '')}${route === '/' ? '' : route}`;
  const ogImage = `${siteUrl.replace(/\/$/, '')}/og-image.svg`;

  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);

  const headInjection = `
    <meta name="description" content="${meta.description}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  `;

  out = out.replace('</head>', `${headInjection}</head>`);
  return out;
}

const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

for (const [route, meta] of Object.entries(ROUTE_META)) {
  const html = injectMeta(baseHtml, route, meta);
  if (route === '/') {
    fs.writeFileSync(path.join(distDir, 'index.html'), html);
    continue;
  }
  const dir = path.join(distDir, route.slice(1));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

console.log(`SEO HTML injected for ${Object.keys(ROUTE_META).length} routes`);
