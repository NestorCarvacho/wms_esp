import React from 'react';
import { LogoWms } from '@/components/ui/images';
import { Card } from '@/components/ui/cards/Card';

interface LoginLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Layout de login (shadcn Card).
 */
export const LoginLayout: React.FC<LoginLayoutProps> = ({
  children,
  title = '¡Bienvenido a WMS!',
  description,
}) => (
  <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700/20 via-transparent to-transparent pointer-events-none" />

    <div className="relative z-10 w-full max-w-md">
      <Card elevation={3} padding="24px" className="border-slate-200/80 shadow-xl">
        <div className="text-center mb-8">
          <LogoWms variant="full" />
          <h1 className="mt-6 text-xl font-semibold text-slate-900">{title}</h1>
        </div>

        {description && (
          <p className="text-sm text-slate-600 mb-6 text-center">{description}</p>
        )}

        {children}
      </Card>

      <p className="mt-6 text-center text-xs text-slate-400">
        WMS Multi-Tenant
      </p>
    </div>
  </div>
);
