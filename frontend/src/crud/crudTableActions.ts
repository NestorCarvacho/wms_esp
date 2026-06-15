import type { TableAction } from '@/components/ui/tables';

export function createCrudTableActions<T>(handlers: {
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  canDelete?: (row: T) => boolean;
  deleteLabel?: string;
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
      label: handlers.deleteLabel ?? 'Eliminar',
      icon: 'trash',
      variant: 'destructive',
      onClick: handlers.onDelete,
      hidden: handlers.canDelete ? (row) => !handlers.canDelete!(row) : undefined,
    },
  ];
}
