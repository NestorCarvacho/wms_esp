import { useState, useCallback, useEffect, useRef, useId } from 'react';
import type { OverflowStrategy } from '@/components/ui/tables/Table.types';


export interface UseTruncatedTooltipReturn {
  ref: React.RefObject<HTMLDivElement>;
  showTooltip: boolean;
  isTruncated: boolean;
  measured: boolean;
  tooltipId: string;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleFocus: () => void;
  handleBlur: () => void;
}

/**
 * Hook to manage truncated content tooltip logic
 * Detects when content is truncated by comparing scrollWidth vs clientWidth
 * Uses ResizeObserver for dynamic measurement when container resizes
 * 
 * @param strategy - Overflow strategy ('truncate' or 'wrap')
 * @param children - Content to measure for truncation
 * @param maxWidth - Legacy parameter for backward compatibility (not used in measurement)
 */
export function useTruncatedTooltip(
  strategy: OverflowStrategy,
  children: React.ReactNode,
  maxWidth: number,
): UseTruncatedTooltipReturn {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [measured, setMeasured] = useState(false);
  const tooltipId = useId();

  const measure = useCallback(() => {
    if (strategy !== 'truncate') return false;
    const element = ref.current;
    if (!element) return false;
    const truncated = element.scrollWidth > element.clientWidth;
    setIsTruncated(truncated);
    setMeasured(true);
    return truncated;
  }, [strategy]);

  useEffect(() => {
    if (strategy !== 'truncate') return;
    const requestAnimationFrameId =
      typeof window !== 'undefined' && 'requestAnimationFrame' in window
        ? window.requestAnimationFrame(() => {
          measure();
        })
        : -1;
    return () => {
      if (
        requestAnimationFrameId !== -1 &&
        typeof window !== 'undefined' &&
        'cancelAnimationFrame' in window
      ) {
        window.cancelAnimationFrame(requestAnimationFrameId);
      }
    };
  }, [children, strategy, maxWidth, measure]);

  useEffect(() => {
    if (strategy !== 'truncate') return;
    if (!(window as any).ResizeObserver) return;
    const cellContentElement = ref.current;
    if (!cellContentElement) return;
    const resizeObserver = new (window as any).ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(cellContentElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [strategy, measure]);

  const handleMouseEnter = useCallback(() => {
    if (strategy !== 'truncate') return;
    // Force a sync measurement on hover to avoid first-hover miss
    const truncated = measure();
    if (truncated) setShowTooltip(true);
  }, [strategy, measure]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (strategy !== 'truncate') return;
    const truncated = measure();
    if (truncated) setShowTooltip(true);
  }, [strategy, measure]);

  const handleBlur = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return {
    ref,
    showTooltip,
    isTruncated,
    measured,
    tooltipId,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
  };
}
