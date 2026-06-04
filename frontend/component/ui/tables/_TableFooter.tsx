import * as React from 'react';
import { Text } from '@/components/ui/text/Text';
import { IconScout } from '@/components/ui/images/IconScout';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { colorClass } from '@/assets/styles/colors';
import { cn } from '@/lib/utils';
import { buildPaginationWindow, getPageSizeOptions } from './Table.utils';
import type { PageToken } from './Table.types';

export interface TableFooterProps {
  pageInfo: { current: number; pageSize: number; total: number } | null;
  onChangePage?: (page: number) => void;
  onChangePageSize?: (size: number) => void;
  totalRows: number;
  disabled?: boolean;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  pageInfo,
  onChangePage,
  onChangePageSize,
  totalRows,
  disabled = false,
}) => (
  <div className="pt-2 px-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Text variant="small-medium" className={colorClass.muted}>
        Total de registros: {totalRows}
      </Text>
      {pageInfo && onChangePage && (
        <div
          className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3"
          data-testid="pagination"
        >
          <div className="flex items-center gap-3 justify-start md:order-2">
            <button
              onClick={() => !disabled && onChangePage(Math.max(1, pageInfo.current - 1))}
              disabled={disabled || pageInfo.current === 1}
              className="inline-flex items-center justify-center h-5 w-5 disabled:opacity-40"
              aria-label="Página anterior"
            >
              <IconScout name="angleLeft" size="md" color="currentColor" className={colorClass.body} />
            </button>

            {(() => {
              const pages = buildPaginationWindow({
                totalItems: pageInfo.total,
                pageSize: pageInfo.pageSize,
                currentPage: pageInfo.current,
              });
              return (
                <div className="flex items-center gap-1">
                  {pages.map((page: PageToken, index: number) =>
                    page === 'ellipsis' ? (
                      <Text
                        key={`ellipsis-${index}`}
                        variant="small-medium"
                        lineHeight="20px"
                        className={colorClass.body}
                      >
                        …
                      </Text>
                    ) : (
                      <button
                        key={page}
                        onClick={() => !disabled && onChangePage(page)}
                        className="inline-flex items-center justify-center h-5 min-w-[20px] px-1"
                        aria-current={page === pageInfo.current ? 'page' : undefined}
                        disabled={disabled}
                      >
                        <Text
                          variant="small-medium"
                          lineHeight="20px"
                          className={cn(
                            page === pageInfo.current ? colorClass.accent : colorClass.body,
                          )}
                        >
                          {page}
                        </Text>
                      </button>
                    ),
                  )}
                </div>
              );
            })()}

            <button
              onClick={() => !disabled && onChangePage(pageInfo.current + 1)}
              disabled={
                disabled || pageInfo.current >= Math.ceil(pageInfo.total / pageInfo.pageSize)
              }
              className="inline-flex items-center justify-center h-5 w-5 disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <IconScout name="angleRight" size="md" color="currentColor" className={colorClass.body} />
            </button>
          </div>

          {(() => {
            const options = getPageSizeOptions(totalRows);
            if (options.length === 0) return null;
            return (
              <div className="flex items-center gap-2 justify-start md:order-1">
                <Text variant="body-regular" className={colorClass.body}>
                  Filas
                </Text>
                <ComboBox
                  label=""
                  value={String(pageInfo.pageSize)}
                  onChange={(value: string | string[]) => {
                    const nextPageSize = Array.isArray(value) ? Number(value[0]) : Number(value);
                    if (!Number.isNaN(nextPageSize) && !disabled) onChangePageSize?.(nextPageSize);
                  }}
                  options={options.map((option) => ({
                    value: String(option),
                    label: String(option),
                  }))}
                  searchable={false}
                  className="!mb-0"
                  labelClassName="hidden"
                  triggerClassName="min-w-[64px]"
                  disabled={disabled}
                  portal
                />
              </div>
            );
          })()}
        </div>
      )}
    </div>
  </div>
);
