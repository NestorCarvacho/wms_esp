import React from 'react';
import logoFull from '@/brand/wms logo2.png';
import logoSolo from '@/brand/logo_solo_m_inver.png';
import logoSoloLarge from '@/brand/logo_solo_XXL.png';

export type LogoWmsVariant = 'full' | 'solo' | 'solo-lg';

const SOURCES: Record<LogoWmsVariant, string> = {
  full: logoFull,
  solo: logoSolo,
  'solo-lg': logoSoloLarge,
};

const DEFAULT_CLASS: Record<LogoWmsVariant, string> = {
  full: 'h-12 mx-auto mb-4',
  solo: 'h-8 w-auto',
  'solo-lg': 'h-16 mx-auto mb-4',
};

interface LogoWmsProps {
  variant?: LogoWmsVariant;
  className?: string;
  alt?: string;
}

export const LogoWms: React.FC<LogoWmsProps> = ({
  variant = 'full',
  className,
  alt = 'WMS',
}) => (
  <img
    src={SOURCES[variant]}
    alt={alt}
    className={className ?? DEFAULT_CLASS[variant]}
  />
);
