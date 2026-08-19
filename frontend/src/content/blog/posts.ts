export interface BlogSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readMinutes: number;
  keywords: string;
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'que-es-un-wms',
    title: 'Qué es un WMS y cuándo lo necesita tu bodega',
    description:
      'Guía clara sobre sistemas de gestión de almacén: qué resuelven, cuándo conviene adoptarlos y señales de que Excel ya no alcanza.',
    publishedAt: '2026-06-01',
    readMinutes: 6,
    keywords: 'qué es un wms, sistema gestión almacén',
    sections: [
      {
        paragraphs: [
          'Un WMS (Warehouse Management System) es el software que coordina la operación diaria de tu bodega: desde que entra mercadería hasta que sale despachada. No es solo un saldo de inventario — es trazabilidad por ubicación, usuario y movimiento.',
        ],
      },
      {
        heading: 'Señales de que necesitas un WMS',
        paragraphs: ['Si reconoces dos o más de estas situaciones, es momento de evaluar un sistema:'],
        bullets: [
          'No sabes con certeza el stock en cada ubicación',
          'Los errores de picking o despacho cuestan dinero o clientes',
          'Varias personas editan el mismo Excel',
          'No puedes responder “quién movió este SKU ayer”',
          'Tu catálogo supera 300–500 referencias activas',
        ],
      },
      {
        heading: 'WMS vs inventario contable',
        paragraphs: [
          'Muchos ERP registran existencias globales. Un WMS operativo como Khepri trabaja a nivel de zona y movimiento: recepción en muelle, traslado a rack, despacho a cliente. Esa granularidad reduce quiebres y acelera la operación en piso.',
        ],
      },
    ],
  },
  {
    slug: 'excel-vs-software-inventario',
    title: 'Excel vs software de inventario de bodega',
    description:
      'Comparativa práctica entre planillas y un WMS: errores ocultos, costos reales y checklist para decidir el cambio.',
    publishedAt: '2026-06-08',
    readMinutes: 7,
    keywords: 'excel vs wms, alternativa excel inventario',
    sections: [
      {
        paragraphs: [
          'Excel es excelente para arrancar, pero no fue diseñado para operaciones concurrentes en bodega. Cuando el volumen crece, los errores dejan de ser “typos” y se convierten en faltantes, sobrestock y clientes insatisfechos.',
        ],
      },
      {
        heading: 'Costos ocultos de Excel',
        bullets: [
          'Horas de reconciliación manual cada semana',
          'Versiones desactualizadas circulando por email',
          'Sin auditoría de quién cambió qué',
          'Dificultad para escanear en piso',
          'Reportes lentos o inconsistentes',
        ],
      },
      {
        heading: 'Cuándo migrar',
        paragraphs: [
          'Un buen umbral es: más de una bodega, más de tres operarios moviendo stock o necesidad de trazabilidad para auditorías. Khepri ofrece migración desde Excel con acompañamiento desde CLP 149.000 en la oferta fundadores.',
        ],
      },
    ],
  },
  {
    slug: 'stock-por-ubicacion',
    title: 'Cómo organizar stock por ubicación en tu almacén',
    description:
      'Buenas prácticas para definir zonas, ubicaciones y flujos de recepción que reducen errores y aceleran despachos.',
    publishedAt: '2026-06-15',
    readMinutes: 5,
    keywords: 'stock por ubicación, zonas bodega',
    sections: [
      {
        paragraphs: [
          'El stock por ubicación significa saber no solo cuánto tienes, sino dónde está cada unidad. Es la base de un WMS operativo y el primer paso para reducir tiempos de búsqueda en piso.',
        ],
      },
      {
        heading: 'Estructura recomendada',
        bullets: [
          'Zona de recepción (muelle) para mercadería recién ingresada',
          'Zonas de almacenamiento (racks, estanterías)',
          'Zona de despacho o consolidación',
          'Codificación consistente (pasillo-rack-nivel)',
        ],
      },
      {
        paragraphs: [
          'En Khepri configuras bodegas, tipos de zona y ubicaciones. Cada recepción, traslado y despacho actualiza el stock en la zona correcta con historial auditado.',
        ],
      },
    ],
  },
  {
    slug: 'errores-inventario-distribucion',
    title: '7 errores comunes de inventario en distribución',
    description:
      'Los fallos más frecuentes en bodegas de distribución y cómo un WMS los previene con trazabilidad y control por ubicación.',
    publishedAt: '2026-06-22',
    readMinutes: 6,
    keywords: 'errores inventario distribución, control bodega',
    sections: [
      {
        paragraphs: ['La distribución exige velocidad sin sacrificar precisión. Estos errores aparecen una y otra vez:'],
        bullets: [
          'Despachar sin validar stock disponible en la ubicación',
          'No registrar devoluciones o rechazos en recepción',
          'Mezclar lotes o presentaciones en la misma ubicación',
          'Permisos amplios: cualquiera puede ajustar stock',
          'Inventarios anuales en lugar de conteos por zona',
          'Catálogo desordenado (SKUs duplicados)',
          'Operar sin historial de movimientos',
        ],
      },
      {
        paragraphs: [
          'Un WMS como Khepri valida stock antes del despacho, registra cada movimiento con usuario y timestamp, y permite permisos granulares por rol.',
        ],
      },
    ],
  },
  {
    slug: 'trazabilidad-bodega',
    title: 'Trazabilidad en bodega: qué es y cómo implementarla',
    description:
      'Qué datos registrar en cada movimiento y por qué la trazabilidad operativa protege tu negocio y a tus clientes.',
    publishedAt: '2026-07-01',
    readMinutes: 5,
    keywords: 'trazabilidad bodega, auditoría inventario',
    sections: [
      {
        paragraphs: [
          'Trazabilidad operativa responde: qué producto se movió, cuánto, desde qué zona hacia cuál, quién lo hizo y cuándo. No es burocracia — es la diferencia entre resolver un reclamo en minutos o en días.',
        ],
      },
      {
        heading: 'Movimientos que debes auditar',
        bullets: ['Recepción de proveedor', 'Traslado interno entre zonas', 'Despacho a cliente o sucursal', 'Ajustes autorizados'],
      },
      {
        paragraphs: [
          'Khepri registra tipos RECEPCION, TRASLADO y DESPACHO en un historial exportable a Excel o PDF, respetando el aislamiento multi-empresa.',
        ],
      },
    ],
  },
  {
    slug: 'como-elegir-wms-pyme',
    title: 'Cómo elegir un WMS para PYME en Chile',
    description:
      'Checklist de 10 criterios para evaluar software de bodega: precio, implementación, soporte local y funciones esenciales.',
    publishedAt: '2026-07-08',
    readMinutes: 8,
    keywords: 'elegir wms pyme chile, software bodega pyme',
    sections: [
      {
        paragraphs: [
          'Elegir un WMS no es comprar el más completo — es el que resuelve tu operación hoy y crece contigo. Para PYME en Chile, prioriza simplicidad, precio transparente y soporte en español.',
        ],
      },
      {
        heading: 'Checklist de evaluación',
        bullets: [
          '¿Control por ubicación o solo saldo global?',
          '¿Recepción, traslado y despacho incluidos?',
          '¿Precio público o solo bajo cotización?',
          '¿Tiempo de implementación realista?',
          '¿Multi-usuario con permisos?',
          '¿Exportaciones y reportes?',
          '¿Escaneo en piso?',
          '¿Soporte local y en español?',
          '¿Contrato flexible sin permanencia?',
          '¿Ruta de crecimiento (multi-bodega, integraciones)?',
        ],
      },
      {
        paragraphs: [
          'Khepri fue diseñado para PYME y operadores logísticos que necesitan operar rápido, con planes desde CLP 29.900/mes en la oferta fundadores.',
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
