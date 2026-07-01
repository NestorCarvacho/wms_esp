export const inventarioKeys = {
  all: ['inventario'] as const,
  dashboard: (empresaId?: number, bodegaId?: number, dias?: number) =>
    [...inventarioKeys.all, 'dashboard', empresaId, bodegaId, dias] as const,
  stock: (params: Record<string, unknown>) =>
    [...inventarioKeys.all, 'stock', params] as const,
  movimientos: (params: Record<string, unknown>) =>
    [...inventarioKeys.all, 'movimientos', params] as const,
};
