import { useQuery } from '@tanstack/react-query';

import { listarTiposProducto, listarUnidadesMedida } from '@/entities/producto/api';
import { productoKeys } from '@/features/producto/model/queryKeys';

export interface ProductoCatalogOptionsParams {
  empresaId?: number;
  enabled?: boolean;
}

export function useProductoCatalogOptions({
  empresaId,
  enabled = true,
}: ProductoCatalogOptionsParams) {
  const listParams = {
    pagina: 1,
    porPagina: 500,
    ...(empresaId != null ? { empresaId } : {}),
  };

  const unidadesQuery = useQuery({
    queryKey: productoKeys.unidades(listParams),
    queryFn: () => listarUnidadesMedida(listParams),
    enabled,
    staleTime: 60_000,
  });

  const tiposQuery = useQuery({
    queryKey: productoKeys.tipos(listParams),
    queryFn: () => listarTiposProducto(listParams),
    enabled,
    staleTime: 60_000,
  });

  return {
    unidades: unidadesQuery.data?.productos ?? [],
    tipos: tiposQuery.data?.tipos_producto ?? [],
    isLoading: unidadesQuery.isLoading || tiposQuery.isLoading,
  };
}
