export interface PaginatedListParams {
  pagina?: number;
  porPagina?: number;
  buscar?: string;
  empresaId?: number;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

export function buildListQuery({
  pagina = DEFAULT_PAGE,
  porPagina = DEFAULT_PAGE_SIZE,
  buscar,
  empresaId,
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
  return params.toString();
}
