import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { OverflowStrategy } from '@/components/ui/tables/Table.types';

export function useTruncatedTooltip(strategy: OverflowStrategy, children: ReactNode, width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [measured, setMeasured] = useState(false);
  const tooltipId = useId();

  useEffect(() => {
    if (strategy !== 'truncate' || !ref.current) {
      setIsTruncated(false);
      setMeasured(true);
      return;
    }

    const element = ref.current;
    setIsTruncated(element.scrollWidth > element.clientWidth);
    setMeasured(true);
  }, [strategy, children, width]);

  return {
    ref,
    showTooltip,
    isTruncated,
    measured,
    tooltipId,
    handleMouseEnter: () => setShowTooltip(true),
    handleMouseLeave: () => setShowTooltip(false),
    handleFocus: () => setShowTooltip(true),
    handleBlur: () => setShowTooltip(false),
  };
}
