import React, { useCallback } from 'react';
import { useUI } from '@/hooks/ui';
import { Card } from '@/components/ui/cards/Card';
import { IconScout } from '@/components/ui/images/IconScout';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';

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

  const handleClose = useCallback(() => {
    closeSidePanel();
  }, [closeSidePanel]);

  if (!isOpen) return null;

  const DynamicComponent = sidePanel?.component ? componentRegistry[sidePanel.component] : null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#D9D9D94D',
          zIndex: 5000,
        }}
        data-testid="side-panel-overlay"
        onClick={handleClose}
      />
      {/* Panel */}
      <Card
        padding="0"
        borderRadius="0px"
        className="fixed top-0 right-0 h-screen w-full max-w-[420px] flex flex-col shadow-xl"
        style={{ zIndex: 5001 }}
        data-testid="side-panel"
      >
        <div className="flex items-center justify-between pt-6 px-6">
          <Text
            variant="body-title-medium"
            color={colors.primary.dash}
          >
            {sidePanel?.title || 'Detalle'}
          </Text>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar panel"
          >
            <IconScout name="close" color={colors.important.main} size="lg" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {DynamicComponent ? <DynamicComponent {...(sidePanel?.props || {})} /> : (
            <p className="text-sm" style={{ color: colors.grays.neutral66 }}>Contenido no disponible.</p>
          )}
        </div>
      </Card>
    </>
  );
};

export default SidePanelContainer;
