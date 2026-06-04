import type { ReactNode } from 'react';
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/shadcn/tooltip';
import { cn } from '@/lib/utils';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  title?: ReactNode;
  body: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  placement?: TooltipPlacement;
  /** @deprecated Radix posiciona automáticamente; se usa `placement` como `side`. */
  strategy?: 'auto' | 'fixed';
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  /** Envuelve el trigger; si no se pasa, solo contenido flotante (legacy tabla). */
  children?: React.ReactElement;
  /** @deprecated Usar `children` como trigger. */
  anchorRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Tooltip WMS — shadcn/ui + Radix.
 * Con `children`: patrón estándar trigger + contenido.
 */
export function Tooltip({
  title,
  body,
  actionLabel,
  onAction,
  placement = 'top',
  maxWidth = 450,
  className,
  style,
  id,
  children,
}: TooltipProps) {
  const content = (
    <TooltipContent
      id={id}
      side={placement}
      className={cn('pointer-events-auto', className)}
      style={{ maxWidth, ...style }}
    >
      {title && <p className="mb-1 font-medium text-foreground">{title}</p>}
      <div className="text-popover-foreground break-words">{body}</div>
      {actionLabel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </TooltipContent>
  );

  if (!children) {
    return null;
  }

  return (
    <UiTooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {content}
    </UiTooltip>
  );
}

export default Tooltip;
