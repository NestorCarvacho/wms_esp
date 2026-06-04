import type { TableAction } from '@/components/ui/tables';

export function createCrudTableActions<T>(handlers: {
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}): TableAction<T>[] {
  return [
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      onClick: handlers.onEdit,
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'trash',
      variant: 'destructive',
      onClick: handlers.onDelete,
    },
  ];
}
