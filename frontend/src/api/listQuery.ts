export type SortDirection = 'asc' | 'desc';

export interface PaginatedListParams {
  pagina?: number;
  porPagina?: number;
  buscar?: string;
  empresaId?: number;
  ordenarPor?: string;
  orden?: SortDirection;
  /** Parámetros adicionales enviados al API (p. ej. filtros por columna). */
  extra?: Record<string, string | number | boolean | undefined>;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

export function buildListQuery({
  pagina = DEFAULT_PAGE,
  porPagina = DEFAULT_PAGE_SIZE,
  buscar,
  empresaId,
  ordenarPor,
  orden,
  extra,
}: PaginatedListParams = {}): string {
  const params = new URLSearchParams({
    pagina: String(pagina),
    por_pagina: String(porPagina),
  });
  const term = buscar?.trim();
  if (term) {
    params.set('buscar', term);
  }
  if (empresaId != null) {
    params.set('empresa_id', String(empresaId));
  }
  if (ordenarPor) {
    params.set('ordenar_por', ordenarPor);
    params.set('orden', orden ?? 'asc');
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === null || value === '') continue;
      params.set(key, String(value));
    }
  }
  return params.toString();
}
