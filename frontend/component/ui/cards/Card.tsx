import React from 'react';
import { Card as UiCard } from '@/components/ui/shadcn/card';
import { cn } from '@/lib/utils';

type CardElevation = 1 | 2 | 3;

interface CardProps {
  children: React.ReactNode;
  elevation?: CardElevation;
  backgroundColor?: string;
  shadowColor?: string;
  borderRadius?: string;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const elevationClass: Record<CardElevation, string> = {
  1: 'shadow-none',
  2: 'shadow-sm',
  3: 'shadow-md',
};

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 2,
  backgroundColor,
  borderRadius,
  padding = '8px',
  className = '',
  style,
  'data-testid': dataTestId,
}) => (
  <UiCard
    data-testid={dataTestId}
    className={cn('border-border', elevationClass[elevation], className)}
    style={{
      backgroundColor,
      borderRadius,
      padding,
      ...style,
    }}
  >
    {children}
  </UiCard>
);

export default Card;
