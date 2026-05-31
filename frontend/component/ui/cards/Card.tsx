import React from 'react';
import { colors } from '@/assets/styles/colors';


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

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 2,
  backgroundColor = colors.grays.neutralFF,
  shadowColor = '#00000026',
  borderRadius = '20px',
  padding = '8px',
  className = '',
  style,
  'data-testid': dataTestId,
}) => {
  const getBlurValue = (): string => {
    switch (elevation) {
      case 1:
        return '0 2px 4px 0';
      case 2:
        return '0 5px 8px 0';
      case 3:
        return '0 4px 16px 0';
      default:
        return '0 5px 8px 0';
    }
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor,
    borderRadius,
    padding,
    boxShadow: `${getBlurValue()} ${shadowColor}`,
    ...style,
  };

  return (
    <div className={className} style={cardStyles} data-testid={dataTestId}>
      {children}
    </div>
  );
};
