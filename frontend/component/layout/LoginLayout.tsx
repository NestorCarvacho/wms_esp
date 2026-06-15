import React from 'react';
import { LogoWms } from '@/components/ui/images';
import { Card } from '@/components/ui/cards/Card';
import { LoginBackground } from './LoginBackground';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_TAGLINE } from '@/config/appBrand';

interface LoginLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Layout de login — variante de fondo en `loginBackgroundConfig.ts`.
 */
export const LoginLayout: React.FC<LoginLayoutProps> = ({
  children,
  title = `¡Bienvenido a ${APP_NAME}!`,
  description,
}) => (
  <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
    <LoginBackground />

    <div className="relative z-10 w-full max-w-md">
      <Card
        elevation={2}
        padding="28px"
        className={cn(
          'border border-border/60 shadow-lg',
          'bg-card',
        )}
      >
        <div className="mb-8 text-center">
          <LogoWms variant="full" />
          <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        </div>

        {description && (
          <p className="mb-6 text-center text-sm text-muted-foreground">{description}</p>
        )}

        {children}
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">{APP_NAME} · {APP_TAGLINE}</p>
    </div>
  </div>
);
