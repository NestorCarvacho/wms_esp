import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { getTooltipText } from '@/components/ui/tables/Table.utils';
import type { OverflowStrategy } from '@/components/ui/tables/Table.types';

function isOverflowing(element: HTMLElement): boolean {
  if (element.scrollWidth > element.clientWidth + 1) return true;
  const inner = element.querySelector<HTMLElement>('[data-cell-text], span');
  if (inner && inner !== element && inner.scrollWidth > inner.clientWidth + 1) return true;
  return false;
}

export function useTruncatedTooltip(
  strategy: OverflowStrategy,
  children: ReactNode,
  width: number,
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const [measured, setMeasured] = useState(false);
  const tooltipId = useId();
  const tooltipText = getTooltipText(children);

  useEffect(() => {
    if (strategy !== 'truncate') {
      setIsTruncated(false);
      setMeasured(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const measure = () => {
      setIsTruncated(isOverflowing(element));
      setMeasured(true);
    };

    measure();
    const raf = requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const parent = element.closest('td');
    if (parent) observer.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [strategy, width, tooltipText, children]);

  return {
    ref,
    isTruncated,
    measured,
    tooltipId,
    tooltipText,
  };
}
