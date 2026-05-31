import React, { useState } from 'react';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';


const LOCAL_ICON_MAP = {
  grid: '/assets/icons/Grid.png',
  remxas: '/assets/icons/RemxasIcon.png',
  filter: '/assets/icons/Filter.png',
} as const;

const ICON_FALLBACK: Record<keyof typeof LOCAL_ICON_MAP, IconScoutName> = {
  grid: 'layers',
  remxas: 'building',
  filter: 'filter',
};

const ALT_MAP: Record<keyof typeof LOCAL_ICON_MAP, string> = {
  grid: 'Grid',
  remxas: 'Remxas',
  filter: 'Filter',
};

export type LocalIconName = keyof typeof LOCAL_ICON_MAP;

export interface LocalIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: LocalIconName;
  className?: string;
  alt?: string;
}

export const LocalIcon: React.FC<LocalIconProps> = ({
  name,
  className = 'w-6 h-6',
  alt,
  ...imgProps
}) => {
  const src = LOCAL_ICON_MAP[name];
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <IconScout name={ICON_FALLBACK[name]} size="md" className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt ?? ALT_MAP[name]}
      className={className}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      {...imgProps}
    />
  );
};