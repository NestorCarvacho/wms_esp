import * as React from 'react';
import { Text } from '@/components/ui/text/Text';
import { IconScout } from '@/components/ui/images/IconScout';
import { Selector } from '@/components/ui/inputs/Selector';
import { colors } from '@/assets/styles/colors';
import { buildPaginationWindow, getPageSizeOptions } from './Table.utils';
import type { PageToken } from './Table.types';


export interface TableFooterProps {
  pageInfo: { current: number; pageSize: number; total: number } | null;
  onChangePage?: (page: number) => void;
  onChangePageSize?: (size: number) => void;
  totalRows: number;
  disabled?: boolean;
}

/**
 * Internal component for table footer with pagination
 * Maintains mobile responsivity with flex-col → flex-row
 */
export const TableFooter: React.FC<TableFooterProps> = ({
  pageInfo,
  onChangePage,
  onChangePageSize,
  totalRows,
  disabled = false,
}) => (
  <div className="pt-2 px-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <Text variant="small-medium" color={colors.grays.neutral99}>
        Total de registros: {totalRows}
      </Text>
      {pageInfo && onChangePage && (
        <div
          className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3"
          data-testid="pagination"
        >
          {/* Pagination: arrows and numbers */}
          <div className="flex items-center gap-3 justify-start md:order-2">
            {/* Left arrow */}
            <button
              onClick={() => !disabled && onChangePage(Math.max(1, pageInfo.current - 1))}
              disabled={disabled || pageInfo.current === 1}
              className="inline-flex items-center justify-center h-5 w-5 disabled:opacity-40"
              aria-label="Página anterior"
            >
              <IconScout name="angleLeft" size="md" color={colors.grays.neutral33} />
            </button>

            {/* Page numbers */}
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
                        color={colors.grays.neutral33}
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
                          color={
                            page === pageInfo.current
                              ? colors.important.main
                              : colors.grays.neutral33
                          }
                        >
                          {page}
                        </Text>
                      </button>
                    ),
                  )}
                </div>
              );
            })()}

            {/* Right arrow */}
            <button
              onClick={() => !disabled && onChangePage(pageInfo.current + 1)}
              disabled={
                disabled || pageInfo.current >= Math.ceil(pageInfo.total / pageInfo.pageSize)
              }
              className="inline-flex items-center justify-center h-5 w-5 disabled:opacity-40"
              aria-label="Página siguiente"
            >
              <IconScout name="angleRight" size="md" color={colors.grays.neutral33} />
            </button>
          </div>

          {/* Page size selector */}
          {(() => {
            const options = getPageSizeOptions(totalRows);
            if (options.length === 0) return null;
            return (
              <div className="flex items-center gap-2 justify-start md:order-1">
                <Text variant="body-regular" color={colors.grays.neutral33}>
                  Filas
                </Text>
                <Selector
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
                  selectClassName="min-w-[64px]"
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
