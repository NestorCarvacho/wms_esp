import React from 'react';
import { Breadcrumb } from '@/components/ui/navigation';
import { Card } from '@/components/ui/cards';
import type { IconScoutName } from '@/components/ui/images/IconScout';


interface RouteItem {
  text: string;
  onClick?: () => void;
}

interface PageLayoutProps {
  // Modo manual (legacy, opcional)
  routes?: RouteItem[];
  icon?: IconScoutName;
  backTo?: string;
  
  // Props compartidas
  children: React.ReactNode;
  titleVariant?: 'header-4' | 'header-5' | 'header-6' | 'body-medium';
  supportingText?: string;
  
  // Modo automático con override dinámico
  dynamicTitle?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  routes,
  icon,
  children,
  titleVariant,
  supportingText,
  backTo,
  dynamicTitle,
}) => {
  // Si se pasan routes, calcular título desde ahí (modo manual)
  const manualTitle = routes && routes.length > 0 ? routes[routes.length - 1].text : undefined;

  return (
    <div>
      <div className="mt-4 md:mt-6 px-4 md:px-8 lg:px-16">
        <Breadcrumb
          icon={icon}
          items={routes}
          title={manualTitle}
          titleVariant={titleVariant}
          supportingText={supportingText}
          backTo={backTo}
          dynamicTitle={dynamicTitle}
        />
      </div>

      <div className="my-4 md:my-6 px-4 md:px-8 lg:px-16">
        <Card elevation={1} padding="" className="p-4 md:p-6 lg:p-8">
          {children}
        </Card>
      </div>
    </div>
  );
};

export default PageLayout;
