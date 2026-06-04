import React, { useCallback } from 'react';
import { useUI } from '@/hooks/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/shadcn/sheet';

const componentRegistry: Record<string, React.FC<any>> = {};

export function registerSidePanelComponent(componentKey: string, Component: React.FC<any>): void {
  componentRegistry[componentKey] = Component;
}

export function clearSidePanelRegistry(): void {
  for (const registryKey of Object.keys(componentRegistry)) {
    delete componentRegistry[registryKey];
  }
}

const SidePanelContainer: React.FC = () => {
  const { sidePanel, closeSidePanel } = useUI();
  const isOpen = !!sidePanel?.open;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeSidePanel();
    },
    [closeSidePanel],
  );

  const DynamicComponent = sidePanel?.component ? componentRegistry[sidePanel.component] : null;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]"
        data-testid="side-panel"
      >
        <div data-testid="side-panel-overlay" className="sr-only" aria-hidden />
        <SheetHeader className="shrink-0 border-b border-border px-6 py-5 text-left">
          <SheetTitle>{sidePanel?.title || 'Detalle'}</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {DynamicComponent ? (
            <DynamicComponent {...(sidePanel?.props || {})} />
          ) : (
            <p className="text-sm text-muted-foreground">Contenido no disponible.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidePanelContainer;
