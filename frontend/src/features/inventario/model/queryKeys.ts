export const inventarioKeys = {
  all: ['inventario'] as const,
  stock: (params: Record<string, unknown>) =>
    [...inventarioKeys.all, 'stock', params] as const,
  movimientos: (params: Record<string, unknown>) =>
    [...inventarioKeys.all, 'movimientos', params] as const,
};
