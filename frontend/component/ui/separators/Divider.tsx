import React from 'react';
import { colors } from '@/assets/styles/colors';


type DividerOrientation = 'h' | 'v';

interface DividerProps {
  orientation?: DividerOrientation;
  color?: string;
  thickness?: number;
  className?: string;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'h',
  color = colors.primary.auxiliar,
  thickness = 1,
  className = '',
}) => {
  const isHorizontal = orientation === 'h';
  
  return (
    <div
      className={`
        ${isHorizontal ? 'w-full h-px' : 'w-px h-full min-h-4'}
        ${className}
      `}
      style={{
        backgroundColor: color,
        [isHorizontal ? 'height' : 'width']: `${thickness}px`,
      }}
    />
  );
};

export default Divider;
