import { useQuery } from '@tanstack/react-query';

import { consultarProducto } from '@/entities/producto/api';
import { productoKeys } from '@/features/producto/model/queryKeys';

export function useProductoConsulta(codigo: string, enabled = false) {
  const term = codigo.trim();
  return useQuery({
    queryKey: productoKeys.consulta(term),
    queryFn: () => consultarProducto(term),
    enabled: enabled && term.length > 0,
    retry: false,
  });
}
