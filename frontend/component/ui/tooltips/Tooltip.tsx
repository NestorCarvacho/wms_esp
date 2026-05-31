import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { Text } from '@/components/ui/text/Text';
import { colors } from '@/assets/styles/colors';


export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  title?: React.ReactNode;
  body: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  placement?: TooltipPlacement;
  strategy?: 'auto' | 'fixed';
  maxWidth?: number;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  body,
  actionLabel,
  onAction,
  placement = 'top',
  strategy = 'auto',
  maxWidth = 450,
  className = '',
  style,
  id,
  anchorRef,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [finalPlacement, setFinalPlacement] = useState<TooltipPlacement>(placement);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
  const tooltipId = id || 'cell-tooltip';

  const computePlacement = useCallback(() => {
    const anchor = anchorRef?.current;
    const tooltipElement = ref.current;
    if (!anchor || !tooltipElement) return;
    const triggerRect = anchor.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Measure tooltip once (currently positioned off-screen initially)
    const { width: tw, height: th } = tooltipElement.getBoundingClientRect();

    // Available space per side
    const space: Record<TooltipPlacement, number> = {
      top: triggerRect.top,
      bottom: vh - triggerRect.bottom,
      left: triggerRect.left,
      right: vw - triggerRect.right,
    };

    const order: TooltipPlacement[] = ['top', 'bottom', 'right', 'left'];
    let chosen: TooltipPlacement = placement;

    if (strategy === 'auto' && !placement) {
      // First pass: choose first side that fully fits (respect order priorities)
      const needed = (side: TooltipPlacement) => (side === 'top' || side === 'bottom') ? th + 8 : tw + 8;
      const firstFit = order.find(side => space[side] >= needed(side));
      if (firstFit) {
        chosen = firstFit;
      } else {
        // Fallback: choose side with maximum available space
        chosen = order.reduce((best, side) => space[side] > space[best] ? side : best, order[0]);
      }
    }
    setFinalPlacement(chosen);

    const gap = 8;
    // Coordinate calculators per placement to reduce branching
    const computeCoords: Record<TooltipPlacement, () => { top: number; left: number }> = {
      top: () => ({
        top: triggerRect.top - th - gap,
        left: triggerRect.left + (triggerRect.width / 2) - (tw / 2),
      }),
      bottom: () => ({
        top: triggerRect.bottom + gap,
        left: triggerRect.left + (triggerRect.width / 2) - (tw / 2),
      }),
      left: () => ({
        top: triggerRect.top + (triggerRect.height / 2) - (th / 2),
        left: triggerRect.left - tw - gap,
      }),
      right: () => ({
        top: triggerRect.top + (triggerRect.height / 2) - (th / 2),
        left: triggerRect.right + gap,
      }),
    };

    let { top, left } = computeCoords[chosen]();
    // Clamp to viewport with 4px margin
    top = Math.max(4, Math.min(top, vh - th - 4));
    left = Math.max(4, Math.min(left, vw - tw - 4));
    setCoords({ top, left });
  }, [anchorRef, placement, strategy]);

  useLayoutEffect(() => { computePlacement(); }, [computePlacement, body, title]);
  useEffect(() => {
    if (strategy !== 'auto') return;
    const handler = () => computePlacement();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    let resizeObserver: ResizeObserver | undefined;
    const anchorEl = anchorRef?.current || null;
    if ((window as any).ResizeObserver) {
      resizeObserver = new (window as any).ResizeObserver(handler);
      if (anchorEl && resizeObserver) resizeObserver.observe(anchorEl);
    }
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
      if (anchorEl && resizeObserver) resizeObserver.unobserve(anchorEl);
    };
  }, [computePlacement, strategy, anchorRef]);

  const arrowSize = 12;
  const half = arrowSize / 2;

  // Normaliza body para forzar color blanco internamente
  const normalizeTooltipBody = (node: React.ReactNode): React.ReactNode => {
    if (node === null || node === undefined || typeof node === 'boolean') return null;
    if (typeof node === 'string' || typeof node === 'number') return node;
    if (Array.isArray(node)) {
      return node.map((child, idx) => (
        <React.Fragment key={idx}>
          {normalizeTooltipBody(child)}
        </React.Fragment>
      ));
    }
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{ style?: React.CSSProperties; children?: React.ReactNode; color?: string }>;
      const existingStyle = element.props.style || {};
      const mergedStyle = { ...existingStyle, color: colors.grays.neutralFF };
      const clonedChildren = normalizeTooltipBody(element.props.children);
      return React.cloneElement(
        element,
        { ...element.props, color: colors.grays.neutralFF, style: mergedStyle },
        clonedChildren,
      );
    }
    return node;
  };
  const safeBody = normalizeTooltipBody(body);

  const renderArrow = () => {
    const base: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      pointerEvents: 'none',
    };
    const color = colors.primary.main;
    switch (finalPlacement) {
      case 'top': // arrow points down (card above anchor)
        return (
          <div
            aria-hidden="true"
            style={{
              ...base,
              left: '50%',
              bottom: -half,
              transform: 'translateX(-50%)',
              borderLeft: `${half}px solid transparent`,
              borderRight: `${half}px solid transparent`,
              borderTop: `${half}px solid ${color}`,
            }}
          />
        );
      case 'bottom': // arrow points up
        return (
          <div
            aria-hidden="true"
            style={{
              ...base,
              left: '50%',
              top: -half,
              transform: 'translateX(-50%)',
              borderLeft: `${half}px solid transparent`,
              borderRight: `${half}px solid transparent`,
              borderBottom: `${half}px solid ${color}`,
            }}
          />
        );
      case 'left': // arrow points right
        return (
          <div
            aria-hidden="true"
            style={{
              ...base,
              top: '50%',
              right: -half,
              transform: 'translateY(-50%)',
              borderTop: `${half}px solid transparent`,
              borderBottom: `${half}px solid transparent`,
              borderLeft: `${half}px solid ${color}`,
            }}
          />
        );
      case 'right': // arrow points left
      default:
        return (
          <div
            aria-hidden="true"
            style={{
              ...base,
              top: '50%',
              left: -half,
              transform: 'translateY(-50%)',
              borderTop: `${half}px solid transparent`,
              borderBottom: `${half}px solid transparent`,
              borderRight: `${half}px solid ${color}`,
            }}
          />
        );
    }
  };

  return (
    <div
      ref={ref}
      role="tooltip"
      id={tooltipId}
      className={`pointer-events-none select-none ${className}`}
      data-placement={finalPlacement}
      style={{ position: 'fixed', maxWidth, top: coords.top, left: coords.left, ...style, zIndex: 1000 }}
    >
      <Card
        elevation={1}
        padding="12px 16px"
        borderRadius="16px"
        style={{ background: colors.primary.main, color: colors.grays.neutralFF, position: 'relative', zIndex: 1 }}
      >
        {title && (
          <Text
            variant="subheader-medium"
            color={colors.primary.auxiliar}
            className="w-full text-center mb-1"
          >
            {title}
          </Text>
        )}
        <Text variant="subheader-regular" color={colors.grays.neutralFF}>
          {safeBody}
        </Text>
        {actionLabel && (
          <div className="mt-2 w-full flex justify-end">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAction?.(); }}
              className="pointer-events-auto"
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Text variant="subheader-regular" color={colors.feedback.success300}>{actionLabel}</Text>
            </button>
          </div>
        )}
        {renderArrow()}
      </Card>
    </div>
  );
};

export default Tooltip;
