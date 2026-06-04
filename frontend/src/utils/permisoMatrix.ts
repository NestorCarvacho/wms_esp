import type { Permiso } from '@/types/api';

export const ACCION_LABELS: Record<string, string> = {
  leer: 'Ver',
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
  importar: 'Importar',
  recepcionar: 'Recepcionar',
  trasladar: 'Trasladar',
  despachar: 'Despachar',
  configurar: 'Configurar',
};

export const ACCION_ORDEN = [
  'leer',
  'crear',
  'editar',
  'eliminar',
  'importar',
  'recepcionar',
  'trasladar',
  'despachar',
  'configurar',
] as const;

/** Módulos mal nombrados en BD → agrupar bajo el recurso correcto. */
const MODULO_ALIASES: Record<string, string> = {
  recepcion: 'inventario',
  despacho: 'inventario',
  traslado: 'inventario',
};

const MODULO_LABELS: Record<string, string> = {
  usuarios: 'Usuarios',
  empresas: 'Empresas',
  cargos: 'Cargos',
  roles: 'Roles',
  permisos: 'Permisos (catálogo)',
  bodegas: 'Bodegas',
  productos: 'Productos',
  unidades_medida: 'Unidades de medida',
  tipos_zona: 'Tipos de zona',
  zonas_bodega: 'Zonas de bodega',
  tipos_producto: 'Tipos de producto',
  producto_presentacion: 'Presentaciones de producto',
  inventario: 'Inventario operativo',
  reportes: 'Reportes',
};

function normalizarModulo(modulo: string): string {
  return MODULO_ALIASES[modulo] ?? modulo;
}

export interface PermisoCelda {
  permisoId: number;
  codigo: string;
  accion: string;
}

export interface PermisoModuloFila {
  modulo: string;
  label: string;
  celdas: PermisoCelda[];
}

export function labelModulo(modulo: string): string {
  const canon = normalizarModulo(modulo);
  return MODULO_LABELS[canon] ?? canon.replace(/_/g, ' ');
}

export function labelAccion(accion: string): string {
  return ACCION_LABELS[accion] ?? accion.replace(/_/g, ' ');
}

export function parsePermisoCodigo(codigo: string): { modulo: string; accion: string } | null {
  const idx = codigo.lastIndexOf('.');
  if (idx <= 0) return null;
  return {
    modulo: codigo.slice(0, idx),
    accion: codigo.slice(idx + 1),
  };
}

/** Agrupa permisos en filas por módulo (página/recurso). */
export function agruparPermisosPorModulo(permisos: Permiso[]): PermisoModuloFila[] {
  const map = new Map<string, PermisoCelda[]>();

  for (const p of permisos) {
    const parsed = parsePermisoCodigo(p.codigo);
    if (!parsed) continue;
    const modulo = normalizarModulo(parsed.modulo);
    const celdas = map.get(modulo) ?? [];
    celdas.push({ permisoId: p.id, codigo: p.codigo, accion: parsed.accion });
    map.set(modulo, celdas);
  }

  return [...map.entries()]
    .map(([modulo, celdas]) => ({
      modulo,
      label: labelModulo(modulo),
      celdas: celdas.sort(
        (a, b) => ACCION_ORDEN.indexOf(a.accion as (typeof ACCION_ORDEN)[number]) -
          ACCION_ORDEN.indexOf(b.accion as (typeof ACCION_ORDEN)[number]),
      ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

/** Acciones presentes en el catálogo (columnas dinámicas: CRUD + operaciones WMS). */
export function accionesEnCatalogo(filas: PermisoModuloFila[]): string[] {
  const set = new Set<string>();
  for (const fila of filas) {
    for (const c of fila.celdas) set.add(c.accion);
  }
  const ordenadas = ACCION_ORDEN.filter((a) => set.has(a));
  const resto = [...set]
    .filter((a) => !ACCION_ORDEN.includes(a as (typeof ACCION_ORDEN)[number]))
    .sort((a, b) => labelAccion(a).localeCompare(labelAccion(b), 'es'));
  return [...ordenadas, ...resto];
}

export function celdaPorAccion(fila: PermisoModuloFila, accion: string): PermisoCelda | undefined {
  return fila.celdas.find((c) => c.accion === accion);
}
