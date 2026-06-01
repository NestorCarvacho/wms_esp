export interface PaginatedListParams {
  pagina?: number;
  porPagina?: number;
  buscar?: string;
  empresaId?: number;
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
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === null || value === '') continue;
      params.set(key, String(value));
    }
  }
  return params.toString();
}
