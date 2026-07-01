import { useQuery } from '@tanstack/react-query';

import type { PaginatedListParams } from '@/api/listQuery';
import { listarProductos } from '@/entities/producto/api';
import { productoKeys } from '@/features/producto/model/queryKeys';

export function useProductoList(params: PaginatedListParams, enabled = true) {
  return useQuery({
    queryKey: productoKeys.list(params),
    queryFn: async () => {
      const res = await listarProductos(params);
      return { items: res.productos, total: res.total };
    },
    enabled,
  });
}
