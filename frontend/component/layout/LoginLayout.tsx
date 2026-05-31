import React from 'react';
import { LogoWms } from '@/components/ui/images';
import { Card } from '@/components/ui/cards/Card';
import { Text } from '@/components/ui/text';
import { colors } from '@/assets/styles/colors';


interface LoginLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ 
  children, 
  title = '¡Bienvenido a WMS!',
  description,
}) => (
  <div 
    className="relative w-full min-h-screen flex justify-center"
    style={{ backgroundColor: colors.grays.neutralFF }}
  >
    <div
      className="fixed top-0 left-0 w-full h-[300px] rounded-b-[15px] z-0"
      style={{
        background: `linear-gradient(${colors.primary.dark}, ${colors.primary.main})`,
      }}
    />

    <div className="relative z-10 w-full max-w-sm mt-[100px]">
      <Card 
        elevation={3}
        borderRadius="16px"
        padding="32px"
        className="mx-auto"
      >
        <div className="text-center mb-8">
          <LogoWms variant="full" />
          <div className="mt-6">
            <Text variant="body-title-medium" color={colors.primary.main}>
              {title}
            </Text>
          </div>
        </div>
          
        {description && (
          <div className="text-left">
            <Text variant="subheader-regular">
              {description}
            </Text>
          </div>
        )}
          
        {children}
      </Card>

      <div className="mt-8">
        <Text variant="subheader-medium" lineHeight="20px" className="text-center" color={colors.primary.dash}>
          Versión 1.1.1.2 Servicio 7/24
        </Text>
      </div>
    </div>
  </div>
);
