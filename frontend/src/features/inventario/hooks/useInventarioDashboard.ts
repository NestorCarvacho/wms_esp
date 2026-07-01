import { useQuery } from '@tanstack/react-query';

import {
  obtenerDashboardInventario,
  type InventarioDashboardParams,
} from '@/entities/inventario/api';
import { inventarioKeys } from '@/features/inventario/model/queryKeys';

export function useInventarioDashboard(
  params: InventarioDashboardParams,
  enabled = true,
) {
  const { empresaId, bodegaId, dias } = params;
  return useQuery({
    queryKey: inventarioKeys.dashboard(empresaId, bodegaId, dias),
    queryFn: () => obtenerDashboardInventario(params),
    enabled,
  });
}
