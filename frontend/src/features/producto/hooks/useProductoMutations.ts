import { useMutation, useQueryClient } from '@tanstack/react-query';

import { actualizarProducto, crearProducto, eliminarProducto } from '@/entities/producto/api';
import { productoKeys } from '@/features/producto/model/queryKeys';
import type { ProductoActualizar, ProductoCrear } from '@/types/api';

export function useProductoMutations() {
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    void queryClient.invalidateQueries({ queryKey: productoKeys.lists() });
  };

  const crear = useMutation({
    mutationFn: (data: ProductoCrear) => crearProducto(data),
    onSuccess: invalidateLists,
  });

  const actualizar = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoActualizar }) =>
      actualizarProducto(id, data),
    onSuccess: invalidateLists,
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: invalidateLists,
  });

  return { crear, actualizar, eliminar };
}
