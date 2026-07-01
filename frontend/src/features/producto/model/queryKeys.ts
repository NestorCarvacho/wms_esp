export const productoKeys = {
  all: ['producto'] as const,
  lists: () => [...productoKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...productoKeys.lists(), params] as const,
  consulta: (codigo: string, empresaId?: number) =>
    [...productoKeys.all, 'consulta', codigo, empresaId] as const,
  tipos: (params: Record<string, unknown>) => [...productoKeys.all, 'tipos', params] as const,
  unidades: (params: Record<string, unknown>) => [...productoKeys.all, 'unidades', params] as const,
};
