import { useCallback, useEffect, useRef, useState } from 'react';


interface UseCalendarPanelOptions {
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface UseCalendarPanelReturn {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLDivElement>;
  panelRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for managing calendar dropdown panel state and interactions
 */
export const useCalendarPanel = ({
  closeOnOutsideClick = true,
  closeOnEscape = true,
  onOpenChange,
}: UseCalendarPanelOptions = {}): UseCalendarPanelReturn => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setOpen(previousOpen => {
      const nextOpen = !previousOpen;
      onOpenChange?.(nextOpen);
      return nextOpen;
    });
  }, [onOpenChange]);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  // Outside click handler
  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };
    
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeOnOutsideClick, close]);

  // ESC key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeOnEscape, close]);

  return { open, toggle, close, triggerRef, panelRef };
};
