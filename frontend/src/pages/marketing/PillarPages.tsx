import { PillarPage } from '@/components/marketing/PillarPage';
import { SEO_ROUTES } from '@/config/seo';

export function SoftwareBodegaPage() {
  return (
    <PillarPage
      meta={SEO_ROUTES['/software-bodega']}
      eyebrow="Software de gestión de bodega"
      title="Software de gestión de bodega para PYME en Chile"
      subtitle="Centraliza catálogo, ubicaciones y operaciones de almacén en una plataforma en la nube. Recepción, traslado y despacho con trazabilidad por SKU y zona."
      sections={[
        {
          heading: 'Qué resuelve un software de bodega',
          paragraphs: [
            'Un sistema de gestión de almacén elimina planillas dispersas y da visibilidad operativa: dónde está cada producto, qué entró hoy y qué salió despachado. Khepri está pensado para equipos que operan en piso, no solo para contabilidad.',
          ],
        },
        {
          heading: 'Módulos incluidos',
          paragraphs: ['Todo lo esencial para digitalizar tu bodega sin proyectos de seis meses:'],
          bullets: [
            'Catálogo de productos con SKU y unidades de medida',
            'Bodegas, tipos de zona y ubicaciones',
            'Recepción con escaneo y zona destino',
            'Traslados internos entre ubicaciones',
            'Despacho con validación de stock',
            'Historial auditado y exportaciones Excel/PDF',
          ],
        },
        {
          heading: 'Para quién es ideal',
          paragraphs: [
            'Distribuidores, retail con centro de distribución, operadores logísticos y e-commerce con bodega propia. Si manejas más de una empresa cliente, el modo multi-tenant te permite aislar datos por razón social.',
          ],
        },
      ]}
    />
  );
}

export function ControlInventarioPage() {
  return (
    <PillarPage
      meta={SEO_ROUTES['/control-inventario']}
      eyebrow="Control de inventario"
      title="Control de inventario de bodega por ubicación"
      subtitle="Ve el stock en cada zona, no solo el total global. Reduce faltantes, acelera despachos y audita cada movimiento con usuario y fecha."
      sections={[
        {
          heading: 'Stock por ubicación vs saldo global',
          paragraphs: [
            'Saber que tienes 500 unidades no alcanza si no sabes si están en recepción, en rack o reservadas para despacho. Khepri modela stock por bodega y zona para decisiones operativas en tiempo real.',
          ],
        },
        {
          heading: 'Movimientos auditados',
          paragraphs: ['Cada operación genera un registro en el historial:'],
          bullets: [
            'RECEPCION — ingreso de mercadería',
            'TRASLADO — cambio de ubicación interna',
            'DESPACHO — salida de stock',
            'Usuario, timestamp y cantidades por línea',
          ],
        },
        {
          heading: 'Reportes exportables',
          paragraphs: [
            'Exporta stock por ubicación e historial de movimientos a Excel o PDF (hasta 50.000 filas), respetando el filtro de empresa en entornos multi-tenant.',
          ],
        },
      ]}
    />
  );
}

export function WmsPymePage() {
  return (
    <PillarPage
      meta={SEO_ROUTES['/wms-pyme']}
      eyebrow="WMS para PYME"
      title="WMS para PYME en Chile: simple, en la nube y accesible"
      subtitle="No necesitas un proyecto enterprise para ordenar tu bodega. Khepri ofrece inventario operativo desde CLP 29.900/mes con implementación en días."
      sections={[
        {
          heading: 'Por qué las PYME postergan un WMS',
          paragraphs: [
            'Precio opaco, implementaciones largas y funciones que no usarás. Khepri invierte en lo que una PYME necesita primero: catálogo, ubicaciones, recepción, traslado, despacho y permisos por rol.',
          ],
        },
        {
          heading: 'Oferta fundadores',
          bullets: [
            'Starter desde CLP 29.900/mes (1 bodega, 3 usuarios)',
            'Business CLP 59.900/mes — plan más popular',
            'Sin permanencia mínima',
            'Migración desde Excel desde CLP 149.000',
          ],
          paragraphs: [],
        },
        {
          heading: 'Implementación ágil',
          paragraphs: [
            'Sin servidores locales. Accede desde el navegador, configura bodegas y zonas, importa productos y capacita a tu equipo en una sesión remota. La mayoría de pilotos operan en menos de una semana.',
          ],
        },
      ]}
    />
  );
}

export function MultiEmpresaPage() {
  return (
    <PillarPage
      meta={SEO_ROUTES['/multi-empresa']}
      eyebrow="Multi-empresa"
      title="WMS multi-empresa para operadores logísticos"
      subtitle="Gestiona varias razones sociales en una sola plataforma con aislamiento total de datos, permisos granulares y visibilidad para empresa maestra."
      sections={[
        {
          heading: 'Multi-tenant nativo',
          paragraphs: [
            'Cada empresa ve únicamente sus productos, bodegas y movimientos. Los usuarios de empresa maestra pueden operar o supervisar tenants autorizados sin mezclar información.',
          ],
        },
        {
          heading: 'RBAC por empresa',
          bullets: [
            'Permisos formato recurso.accion (ej. inventario.despachar)',
            'Roles, cargos y asignación flexible',
            'Menú dinámico según permisos del usuario',
          ],
          paragraphs: [],
        },
        {
          heading: 'Escalabilidad comercial',
          paragraphs: [
            'Ideal para 3PL, operadores logísticos y holdings que incorporan clientes sin desplegar un sistema nuevo por cada uno. Plan Pro incluye hasta 20 usuarios y 5 bodegas por empresa.',
          ],
        },
      ]}
    />
  );
}

export function CompararExcelPage() {
  return (
    <PillarPage
      meta={SEO_ROUTES['/comparar/excel']}
      eyebrow="Comparativa"
      title="Excel vs software de inventario de bodega"
      subtitle="Cuándo una planilla deja de ser suficiente y cómo migrar a un WMS sin frenar la operación."
      sections={[
        {
          heading: 'Excel funciona hasta que deja de funcionar',
          paragraphs: [
            'Para 50 SKUs y una persona, Excel puede bastar. Con más volumen, concurrencia y auditorías, los errores y el tiempo de reconciliación superan el costo de un SaaS mensual.',
          ],
        },
        {
          heading: 'Comparación rápida',
          bullets: [
            'Excel: bajo costo inicial, alto costo oculto en horas y errores',
            'WMS: costo mensual predecible, trazabilidad y escaneo en piso',
            'Excel: sin permisos granulares ni historial confiable',
            'Khepri: roles, movimientos auditados y stock por ubicación',
          ],
          paragraphs: [],
        },
        {
          heading: 'Migración sin trauma',
          paragraphs: [
            'Khepri permite importación masiva de productos y acompañamiento en la oferta fundadores. La mayoría de clientes mantiene Excel solo para reportes externos durante la transición.',
          ],
        },
      ]}
    />
  );
}
