import React from 'react';
import { cn } from '@/lib/utils';
import logoFull from '@/brand/khepri-isotipo.png';
import logoSolo from '@/brand/khepri-logo.png';

export type LogoWmsVariant = 'full' | 'solo' | 'solo-lg';

const SOURCES: Record<LogoWmsVariant, string> = {
  full: logoFull,
  solo: logoSolo,
  'solo-lg': logoSolo,
};

const DEFAULT_CLASS: Record<LogoWmsVariant, string> = {
  full: 'mx-auto mb-2 h-28 w-auto',
  solo: 'h-8 w-auto',
  'solo-lg': 'mx-auto mb-4 h-16 w-auto',
};

interface LogoWmsProps {
  variant?: LogoWmsVariant;
  className?: string;
  alt?: string;
}

export const LogoWms: React.FC<LogoWmsProps> = ({
  variant = 'full',
  className,
  alt = 'Khepri Software',
}) => (
  <img
    src={SOURCES[variant]}
    alt={alt}
    className={cn('dark:mix-blend-screen', className ?? DEFAULT_CLASS[variant])}
  />
);
