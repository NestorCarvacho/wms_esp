import React from 'react';
import { colors } from '@/assets/styles/colors';


type FontFamily = 'roboto' | 'montserrat';
type LineHeight = 'default' | '130%' | '20px';

// Unified variants for all text types
export type TextVariant = keyof typeof textStyles;

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  fontFamily?: FontFamily;
  lineHeight?: LineHeight;
  className?: string;
  color?: string;
  as?: keyof React.JSX.IntrinsicElements;
  onClick?: () => void;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

const fontFamilyMap = {
  roboto: 'Roboto, sans-serif',
  montserrat: 'Montserrat, sans-serif',
};

const calculateLineHeight = (
  lineHeight: LineHeight,
  variant: string,
): string => {
  if (lineHeight !== 'default') return lineHeight;
  
  if (variant.includes('body-') || variant.includes('subheader-')) {
    return '130%';
  }
  
  return '100%';
};

const getDefaultColor = (lineHeight: LineHeight): string => {
  if (lineHeight === '20px') return colors.grays.neutral00;
  return colors.grays.neutral33;
};

const textStyles = {
  // Header styles
  'header-1': { fontSize: '82px', fontWeight: 500 },
  'header-2': { fontSize: '62px', fontWeight: 500 },
  'header-3': { fontSize: '42px', fontWeight: 500 },
  'header-4': { fontSize: '32px', fontWeight: 500 },
  'header-5': { fontSize: '25px', fontWeight: 500 },
  'header-6': { fontSize: '18px', fontWeight: 500 },
  
  // Body styles
  'body-title': { fontSize: '22px', fontWeight: 400 },
  'body-title-medium': { fontSize: '22px', fontWeight: 500 },
  'body-medium': { fontSize: '16px', fontWeight: 500 },
  'body-regular': { fontSize: '16px', fontWeight: 400 },
  'body-light': { fontSize: '16px', fontWeight: 300 },
  
  // SubHeader styles
  'subheader-medium': { fontSize: '14px', fontWeight: 500 },
  'subheader-regular': { fontSize: '14px', fontWeight: 400 },
  'subheader-light': { fontSize: '14px', fontWeight: 300 },
  
  // Small styles
  'small-medium': { fontSize: '12px', fontWeight: 500 },
  'small-regular': { fontSize: '12px', fontWeight: 400 },
  'small-light': { fontSize: '12px', fontWeight: 300 },
};

// Default element mapping for variants
const getDefaultElement = (variant: TextVariant): keyof React.JSX.IntrinsicElements => {
  if (variant.startsWith('header-')) {
    const level = variant.split('-')[1];
    return `h${level}` as keyof React.JSX.IntrinsicElements;
  }
  
  if (variant.startsWith('body-')) {
    return 'p';
  }
  
  if (variant.startsWith('subheader-')) {
    return 'p';
  }
  
  if (variant.startsWith('small-')) {
    return 'small';
  }
  
  return 'span';
};

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body-regular',
  fontFamily = 'roboto',
  lineHeight = 'default',
  className = '',
  color,
  as,
  onClick,
  style: externalStyle,
  'data-testid': dataTestId,
}) => {
  const Element = as || getDefaultElement(variant);
  const currentStyle = textStyles[variant] || textStyles['body-regular'];

  const styles: React.CSSProperties = {
    fontSize: currentStyle.fontSize,
    fontWeight: currentStyle.fontWeight,
    fontFamily: fontFamilyMap[fontFamily],
    lineHeight: calculateLineHeight(lineHeight, variant),
    margin: 0,
    color: color || getDefaultColor(lineHeight),
    ...externalStyle,
  };

  return React.createElement(Element, { className, style: styles, onClick, 'data-testid': dataTestId }, children);
};
