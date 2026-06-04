import { useMemo } from 'react';
import { ActionMenu } from '@/components/ui/menus';
import { ACTIONS_COLUMN_WIDTH } from '@/components/ui/tables/Table.constants';
import { computeTableMinWidth } from '@/components/ui/tables/Table.utils';
import type { TableAction, TableColumn } from '@/components/ui/tables/Table.types';

interface UseTableColumnsParams<T> {
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  actionsHeader?: string;
  selectable: boolean;
}

export function useTableColumns<T>({
  columns,
  actions,
  actionsHeader,
  selectable,
}: UseTableColumnsParams<T>) {
  const effectiveColumns = useMemo(() => {
    if (!actions?.length) {
      return columns;
    }

    const actionsColumn: TableColumn<T> = {
      key: '__actions__',
      header: actionsHeader ?? '',
      width: ACTIONS_COLUMN_WIDTH,
      align: 'center',
      render: (row: T) => (
        <ActionMenu
          items={actions
            .filter((action) => !action.hidden?.(row))
            .map((action) => ({
              id: action.id,
              label: action.label,
              icon: action.icon,
              color: action.color,
              variant: action.variant,
              disabled: action.disabled?.(row),
              onClick: () => action.onClick(row),
            }))}
        />
      ),
    };

    return [...columns, actionsColumn];
  }, [columns, actions, actionsHeader]);

  const minTableWidth = useMemo(
    () => computeTableMinWidth(effectiveColumns, selectable),
    [effectiveColumns, selectable],
  );

  return { effectiveColumns, minTableWidth };
}
