import * as React from 'react';
import { Tooltip } from '@/components/ui/tooltips/Tooltip';
import { useTruncatedTooltip } from '@/hooks/ui/table';
import { getAlignmentClasses } from './Table.utils';
import { DEFAULT_COLUMN_WIDTH } from './Table.constants';
import type { OverflowStrategy, ColumnAlign } from './Table.types';


export interface TableCellProps {
  children: React.ReactNode;
  strategy: OverflowStrategy;
  width: string | number | undefined;
  align: ColumnAlign;
}

/**
 * Internal component for rendering table cell content with optional tooltip
 * Uses 100% width to fill the td container, eliminating whitespace
 * while respecting maxWidth constraints set on the td itself
 */
export const TableCell: React.FC<TableCellProps> = ({
  children,
  strategy,
  width,
  align = 'left',
}) => {
  // For backward compatibility, keep width prop but use 100% to fill td
  // The actual width constraint is now on the td element (maxWidth)
  const effectiveWidth = typeof width === 'number'
    ? width
    : width ? parseInt(width, 10) || DEFAULT_COLUMN_WIDTH : DEFAULT_COLUMN_WIDTH;

  const {
    ref,
    showTooltip,
    isTruncated,
    measured,
    tooltipId,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
  } = useTruncatedTooltip(strategy, children, effectiveWidth);

  const { justify: justifyClass } = getAlignmentClasses(align);

  // Wrapper classes based on strategy
  const wrapperClass =
    strategy === 'truncate'
      ? 'overflow-hidden text-ellipsis whitespace-nowrap'
      : 'whitespace-normal break-words';

  // Content uses 100% of td width to eliminate whitespace
  // The td itself has maxWidth constraint to prevent excessive expansion
  const contentStyle: React.CSSProperties =
    strategy === 'truncate'
      ? { width: '100%', maxWidth: '100%' }
      : { width: '100%', maxWidth: '100%' };

  const content = (
    <div
      ref={ref}
      className={`${wrapperClass} ${align === 'center' || align === 'right' ? `flex ${justifyClass}` : ''}`}
      style={contentStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      tabIndex={isTruncated ? 0 : -1}
      aria-describedby={isTruncated ? tooltipId : undefined}
    >
      {children}
    </div>
  );

  if (strategy !== 'truncate') return content;

  // Wrap in container to maintain alignment behavior
  const wrapperStyle: React.CSSProperties = { width: '100%' };

  const wrapperJustifyClass =
    align === 'center'
      ? 'flex justify-center'
      : align === 'right'
        ? 'flex justify-end'
        : '';

  return (
    <div className={`relative ${wrapperJustifyClass}`} style={wrapperStyle}>
      {content}
      {showTooltip && isTruncated && measured && (
        <Tooltip id={tooltipId} body={children} anchorRef={ref} strategy="auto" />
      )}
    </div>
  );
};
