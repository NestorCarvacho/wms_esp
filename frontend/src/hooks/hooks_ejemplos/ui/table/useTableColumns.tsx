import { useMemo } from 'react';
import { ActionMenu } from '@/components/ui/menus';
import { computeTableMinWidth, ACTIONS_COLUMN_WIDTH } from '@/components/ui/tables/Table.utils.tsx';
import type { TableColumn, TableAction } from '@/components/ui/tables/Table.types';


export interface UseTableColumnsOptions<T> {
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  actionsHeader?: string;
  selectable: boolean;
}

export interface UseTableColumnsReturn<T> {
  effectiveColumns: TableColumn<T>[];
  minTableWidth: number;
}

/**
 * Hook to compute effective columns (base columns + actions column if provided)
 * Also calculates minimum table width for responsiveness
 * Actions column width is fixed at ACTIONS_COLUMN_WIDTH (48px)
 */
export function useTableColumns<T extends Record<string, any>>(
  options: UseTableColumnsOptions<T>,
): UseTableColumnsReturn<T> {
  const { columns, actions, actionsHeader, selectable } = options;

  const effectiveColumns = useMemo<TableColumn<T>[]>(() => {
    const cols = [...columns];

    if (actions && actions.length > 0) {
      cols.push({
        key: '__table_actions__',
        header: actionsHeader ?? '',
        width: ACTIONS_COLUMN_WIDTH,
        align: 'center',
        sortable: false,
        overflowStrategy: 'truncate',
        render: (row: T) => {
          const visibleActions = actions.filter(
            (action) => !action.hidden || !action.hidden(row),
          );

          if (visibleActions.length === 0) return null;

          return (
            <ActionMenu
              items={visibleActions.map((action) => ({
                id: action.id,
                label: action.label,
                icon: action.icon,
                onClick: () => action.onClick(row),
                color: action.color,
                disabled: action.disabled ? action.disabled(row) : false,
              }))}
            />
          );
        },
      });
    }

    return cols;
  }, [columns, actions, actionsHeader]);

  const minTableWidth = useMemo(
    () => computeTableMinWidth(effectiveColumns, selectable),
    [effectiveColumns, selectable],
  );

  return {
    effectiveColumns,
    minTableWidth,
  };
}
