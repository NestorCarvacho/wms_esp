import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
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

export const TableCell: React.FC<TableCellProps> = ({
  children,
  strategy,
  width,
  align = 'left',
}) => {
  const effectiveWidth =
    typeof width === 'number'
      ? width
      : width
        ? parseInt(width, 10) || DEFAULT_COLUMN_WIDTH
        : DEFAULT_COLUMN_WIDTH;

  const { ref, isTruncated, measured, tooltipId, tooltipText } = useTruncatedTooltip(
    strategy,
    children,
    effectiveWidth,
  );

  const { text: textAlignClass } = getAlignmentClasses(align);

  const inner = (
    <div
      ref={ref}
      data-cell-text
      className={`block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-foreground ${textAlignClass}`}
    >
      {children}
    </div>
  );

  if (strategy !== 'truncate') {
    return (
      <div className="w-full min-w-0 whitespace-normal break-words text-foreground">{children}</div>
    );
  }

  const showTooltip = measured && isTruncated && tooltipText.length > 0;

  if (!showTooltip) {
    return inner;
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div
          className="block w-full min-w-0 cursor-default rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          tabIndex={0}
          aria-describedby={tooltipId}
        >
          {inner}
        </div>
      </TooltipTrigger>
      <TooltipContent
        id={tooltipId}
        side="top"
        className="z-[100] max-w-[min(450px,90vw)] break-words"
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};
