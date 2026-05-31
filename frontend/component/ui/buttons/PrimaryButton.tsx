import React from 'react';
import { colors } from '@/assets/styles/colors';
import { Text, type TextVariant } from '@/components/ui/text/Text';
import { IconScout } from '@/components/ui/images/IconScout';


type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type TextAlign = 'left' | 'center' | 'right';
type ButtonColor = 'primary' | 'alert' | 'error' | 'important' | 'success';

interface CustomButtonVariantState {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  iconColor?: string;
}

interface CustomButtonVariant {
  default?: CustomButtonVariantState;
  hover?: CustomButtonVariantState;
  pressed?: CustomButtonVariantState;
  focus?: CustomButtonVariantState;
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  colorVariant?: ButtonColor;
  textAlign?: TextAlign;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  customVariant?: CustomButtonVariant;
  textVariant?: TextVariant;
  iconSize?: number;
  'data-testid'?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  fullWidth = false,
  variant = 'primary',
  size = 'md',
  colorVariant = 'primary',
  textAlign = 'center',
  iconLeft,
  iconRight,
  customVariant,
  textVariant,
  iconSize,
  'data-testid': dataTestId,
}) => {
  const isDisabled = disabled || isLoading;
  const { primary, important, feedback, grays } = colors;

  // Unified button styles configuration
  type ButtonState = 'default' | 'hover' | 'pressed' | 'focus' | 'disabled' | 'loading';

  interface StateStyles {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    iconColor?: string;
  }

  const BUTTON_STYLES: Record<
    ButtonVariant,
    Record<ButtonColor, Record<ButtonState, StateStyles>>
  > = {
    primary: {
      primary: {
        default: { backgroundColor: primary.main, textColor: grays.neutralFF, borderColor: 'transparent', iconColor: primary.auxiliar },
        hover: { backgroundColor: primary.dash, textColor: grays.neutralFF, borderColor: 'transparent', iconColor: primary.auxiliar },
        pressed: { backgroundColor: primary.dark, textColor: grays.neutralFF, borderColor: 'transparent', iconColor: primary.auxiliar },
        focus: { backgroundColor: primary.main, textColor: grays.neutralFF, borderColor: 'transparent', iconColor: primary.auxiliar },
        disabled: { backgroundColor: grays.neutralCC, textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: primary.main, textColor: grays.neutralFF, borderColor: 'transparent', iconColor: primary.auxiliar },
      },
      alert: {
        default: { backgroundColor: feedback.alert300, textColor: grays.neutral33, borderColor: 'transparent' },
        hover: { backgroundColor: feedback.alert400, textColor: grays.neutralFF, borderColor: 'transparent' },
        pressed: { backgroundColor: feedback.alert300, textColor: grays.neutral33, borderColor: 'transparent' },
        focus: { backgroundColor: feedback.alert300, textColor: grays.neutral33, borderColor: 'transparent' },
        disabled: { backgroundColor: grays.neutralCC, textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: feedback.alert300, textColor: grays.neutral33, borderColor: 'transparent' },
      },
      error: {
        default: { backgroundColor: feedback.error300, textColor: grays.neutralFF, borderColor: 'transparent' },
        hover: { backgroundColor: feedback.error400, textColor: grays.neutralFF, borderColor: 'transparent' },
        pressed: { backgroundColor: feedback.error300, textColor: grays.neutralFF, borderColor: 'transparent' },
        focus: { backgroundColor: feedback.error300, textColor: grays.neutralFF, borderColor: 'transparent' },
        disabled: { backgroundColor: grays.neutralCC, textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: feedback.error300, textColor: grays.neutralFF, borderColor: 'transparent' },
      },
      important: {
        default: { backgroundColor: important.main, textColor: grays.neutralFF, borderColor: 'transparent' },
        hover: { backgroundColor: important.dark, textColor: grays.neutralFF, borderColor: 'transparent' },
        pressed: { backgroundColor: important.main, textColor: grays.neutralFF, borderColor: 'transparent' },
        focus: { backgroundColor: important.main, textColor: grays.neutralFF, borderColor: 'transparent' },
        disabled: { backgroundColor: grays.neutralCC, textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: important.main, textColor: grays.neutralFF, borderColor: 'transparent' },
      },
      success: {
        default: { backgroundColor: feedback.success300, textColor: primary.main, borderColor: 'transparent' },
        hover: { backgroundColor: feedback.success200, textColor: primary.main, borderColor: 'transparent' },
        pressed: { backgroundColor: feedback.success300, textColor: primary.main, borderColor: 'transparent' },
        focus: { backgroundColor: feedback.success300, textColor: primary.main, borderColor: 'transparent' },
        disabled: { backgroundColor: grays.neutralCC, textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: feedback.success300, textColor: primary.main, borderColor: 'transparent' },
      },
    },
    outline: {
      primary: {
        default: { backgroundColor: 'transparent', textColor: primary.main, borderColor: primary.main, iconColor: primary.auxiliar },
        hover: { backgroundColor: 'transparent', textColor: primary.main, borderColor: primary.dash, iconColor: primary.main },
        pressed: { backgroundColor: 'transparent', textColor: primary.dark, borderColor: primary.dark, iconColor: primary.dark },
        focus: { backgroundColor: 'transparent', textColor: primary.main, borderColor: primary.main, iconColor: primary.auxiliar },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: grays.neutralCC },
        loading: { backgroundColor: 'transparent', textColor: primary.main, borderColor: primary.main, iconColor: primary.auxiliar },
      },
      alert: {
        default: { backgroundColor: 'transparent', textColor: feedback.alert300, borderColor: feedback.alert300 },
        hover: { backgroundColor: 'transparent', textColor: feedback.alert300, borderColor: feedback.alert300 },
        pressed: { backgroundColor: 'transparent', textColor: feedback.alert400, borderColor: feedback.alert400 },
        focus: { backgroundColor: 'transparent', textColor: feedback.alert400, borderColor: feedback.alert300 },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: grays.neutralCC },
        loading: { backgroundColor: 'transparent', textColor: feedback.alert300, borderColor: feedback.alert300 },
      },
      error: {
        default: { backgroundColor: 'transparent', textColor: feedback.error300, borderColor: feedback.error300 },
        hover: { backgroundColor: 'transparent', textColor: feedback.error400, borderColor: feedback.error400 },
        pressed: { backgroundColor: 'transparent', textColor: feedback.error500, borderColor: feedback.error500 },
        focus: { backgroundColor: 'transparent', textColor: feedback.error300, borderColor: feedback.error300 },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: grays.neutralCC },
        loading: { backgroundColor: 'transparent', textColor: feedback.error300, borderColor: feedback.error300 },
      },
      important: {
        default: { backgroundColor: 'transparent', textColor: important.main, borderColor: important.main },
        hover: { backgroundColor: 'transparent', textColor: important.dark, borderColor: important.dark },
        pressed: { backgroundColor: 'transparent', textColor: important.dark, borderColor: important.dark },
        focus: { backgroundColor: 'transparent', textColor: important.main, borderColor: important.main },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: grays.neutralCC },
        loading: { backgroundColor: 'transparent', textColor: important.main, borderColor: important.main },
      },
      success: {
        default: { backgroundColor: 'transparent', textColor: primary.main, borderColor: feedback.success300 },
        hover: { backgroundColor: 'transparent', textColor: feedback.success300, borderColor: feedback.success300 },
        pressed: { backgroundColor: 'transparent', textColor: feedback.success400, borderColor: feedback.success400 },
        focus: { backgroundColor: 'transparent', textColor: primary.main, borderColor: feedback.success300 },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: grays.neutralCC },
        loading: { backgroundColor: 'transparent', textColor: primary.main, borderColor: feedback.success300 },
      },
    },
    ghost: {
      primary: {
        default: { backgroundColor: 'transparent', textColor: primary.main, borderColor: 'transparent', iconColor: primary.auxiliar },
        hover: { backgroundColor: primary.background, textColor: primary.main, borderColor: 'transparent', iconColor: primary.main },
        pressed: { backgroundColor: 'transparent', textColor: primary.dark, borderColor: 'transparent', iconColor: primary.dark },
        focus: { backgroundColor: 'transparent', textColor: primary.main, borderColor: 'transparent', iconColor: primary.auxiliar },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: 'transparent', textColor: primary.main, borderColor: 'transparent', iconColor: primary.auxiliar },
      },
      alert: {
        default: { backgroundColor: 'transparent', textColor: feedback.alert300, borderColor: 'transparent' },
        hover: { backgroundColor: feedback.alert100, textColor: feedback.alert300, borderColor: 'transparent' },
        pressed: { backgroundColor: 'transparent', textColor: feedback.alert400, borderColor: 'transparent' },
        focus: { backgroundColor: 'transparent', textColor: feedback.alert400, borderColor: 'transparent' },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: 'transparent', textColor: feedback.alert300, borderColor: 'transparent' },
      },
      error: {
        default: { backgroundColor: 'transparent', textColor: feedback.error300, borderColor: 'transparent' },
        hover: { backgroundColor: feedback.error100, textColor: feedback.error300, borderColor: 'transparent' },
        pressed: { backgroundColor: 'transparent', textColor: feedback.error500, borderColor: 'transparent' },
        focus: { backgroundColor: 'transparent', textColor: feedback.error300, borderColor: 'transparent' },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: 'transparent', textColor: feedback.error300, borderColor: 'transparent' },
      },
      important: {
        default: { backgroundColor: 'transparent', textColor: important.main, borderColor: 'transparent' },
        hover: { backgroundColor: primary.background, textColor: important.dark, borderColor: 'transparent' },
        pressed: { backgroundColor: 'transparent', textColor: important.dark, borderColor: 'transparent' },
        focus: { backgroundColor: grays.neutralFF, textColor: important.main, borderColor: 'transparent' },
        disabled: { backgroundColor: grays.neutralFF, textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: 'transparent', textColor: important.main, borderColor: 'transparent' },
      },
      success: {
        default: { backgroundColor: 'transparent', textColor: feedback.success300, borderColor: 'transparent' },
        hover: { backgroundColor: feedback.success100, textColor: feedback.success300, borderColor: 'transparent' },
        pressed: { backgroundColor: 'transparent', textColor: feedback.success400, borderColor: 'transparent' },
        focus: { backgroundColor: 'transparent', textColor: feedback.success300, borderColor: 'transparent' },
        disabled: { backgroundColor: 'transparent', textColor: grays.neutral99, borderColor: 'transparent' },
        loading: { backgroundColor: 'transparent', textColor: feedback.success300, borderColor: 'transparent' },
      },
    },
  };

  const getStyles = (state: ButtonState): StateStyles =>
    BUTTON_STYLES[variant][colorVariant][state];

  const mergeCustomStyles = (
    baseStyles: StateStyles,
    customState?: CustomButtonVariantState,
  ): StateStyles => ({
    backgroundColor: customState?.backgroundColor ?? baseStyles.backgroundColor,
    textColor: customState?.textColor ?? baseStyles.textColor,
    borderColor: customState?.borderColor ?? baseStyles.borderColor,
    iconColor: customState?.iconColor ?? baseStyles.iconColor,
  });

  const sizeConfig = {
    sm: { 
      padding: { default: 'py-1.5 px-4', outline: 'py-[4px] px-4' }, 
      iconSize: 14,
      text: { variant: 'subheader-medium' as TextVariant },
    },
    md: { 
      padding: { default: 'py-2 px-4', outline: 'py-[6px] px-4' }, 
      iconSize: 16,
      text: { variant: 'body-medium' as TextVariant },
    },
    lg: { 
      padding: { default: 'py-2.5 px-6', outline: 'py-[8px] px-6' }, 
      iconSize: 22,
      text: { variant: 'body-title-medium' as TextVariant },
    },
  } as const;

  const alignConfig = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Valores derivados
  const currentSize = sizeConfig[size];
  const currentAlign = alignConfig[textAlign];
  const currentVariant = variant === 'primary' ? 'shadow-sm' : 'bg-transparent';
  const currentPadding = variant === 'outline' ? currentSize.padding.outline : currentSize.padding.default;
  const currentIconSize = iconSize ?? currentSize.iconSize;

  // Estados de estilo con personalización
  const defaultStyles = getStyles(isLoading ? 'loading' : isDisabled ? 'disabled' : 'default');
  const hoverStyles = getStyles('hover');
  const pressedStyles = getStyles('pressed');
  const focusStyles = getStyles('focus');

  const stateStyles = {
    default: mergeCustomStyles(defaultStyles, customVariant?.default),
    hover: mergeCustomStyles(hoverStyles, customVariant?.hover),
    pressed: mergeCustomStyles(pressedStyles, customVariant?.pressed),
    focus: mergeCustomStyles(focusStyles, customVariant?.focus),
  };

  const [iconColorState, setIconColorState] = React.useState<'default' | 'hover' | 'pressed' | 'focus'>('default');

  const renderIcon = (icon: React.ReactNode) => {
    if (!icon) return null;
    const originalIcon = icon as React.ReactElement<any>;
    const hasExplicitColor = originalIcon.props?.color !== undefined;
    
    const finalColor = hasExplicitColor 
      ? originalIcon.props.color 
      : stateStyles[iconColorState].iconColor;
    
    return React.cloneElement(originalIcon, {
      size: currentIconSize,
      color: finalColor,
      style: {
        display: 'block',
        margin: '0 auto',
        ...originalIcon.props?.style,
      },
    });
  };

  const hasLeftIcon = !!iconLeft;
  const hasRightIcon = !!iconRight;
  const hasAnyIcon = hasLeftIcon || hasRightIcon;

  // Event handlers centralizados
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      setIconColorState('hover');
      const target = e.currentTarget;
      Object.assign(target.style, {
        backgroundColor: stateStyles.hover.backgroundColor,
        color: stateStyles.hover.textColor,
        borderColor: stateStyles.hover.borderColor,
        boxShadow: variant === 'primary' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : target.style.boxShadow,
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      setIconColorState('default');
      const target = e.currentTarget;
      Object.assign(target.style, {
        backgroundColor: stateStyles.default.backgroundColor,
        color: stateStyles.default.textColor,
        borderColor: stateStyles.default.borderColor,
        boxShadow: variant === 'primary' && !isDisabled ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      setIconColorState('pressed');
      const target = e.currentTarget;
      Object.assign(target.style, {
        backgroundColor: stateStyles.pressed.backgroundColor,
        color: stateStyles.pressed.textColor,
        borderColor: stateStyles.pressed.borderColor,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      setIconColorState('hover');
      const target = e.currentTarget;
      Object.assign(target.style, {
        backgroundColor: stateStyles.hover.backgroundColor,
        color: stateStyles.hover.textColor,
        borderColor: stateStyles.hover.borderColor,
      });
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    setIconColorState('focus');
    const target = e.currentTarget;
    
    Object.assign(target.style, {
      backgroundColor: stateStyles.focus.backgroundColor,
      color: stateStyles.focus.textColor,
      borderColor: stateStyles.focus.borderColor,
    });

    if (variant === 'outline') {
      target.style.boxShadow = `0 0 0 2px ${important.intermediate}`;
    } else if (variant === 'ghost') {
      target.style.boxShadow = `inset 0 0 0 2px ${important.intermediate}`;
    } else {
      target.style.boxShadow = `inset 0 0 0 2px ${important.intermediate}`;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    setIconColorState('default');
    const target = e.currentTarget;
    
    Object.assign(target.style, {
      backgroundColor: stateStyles.default.backgroundColor,
      color: stateStyles.default.textColor,
      borderColor: stateStyles.default.borderColor,
      boxShadow: variant === 'primary' && !isDisabled ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
    });
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      data-testid={dataTestId}
      className={`
        relative
        inline-flex
        items-center
        ${currentAlign}
        ${currentPadding}
        font-roboto
        font-medium
        rounded-3xl
        transition-all
        duration-200
        outline-none
        ${currentVariant}
        ${fullWidth ? 'w-full' : 'min-w-[100px]'}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        backgroundColor: stateStyles.default.backgroundColor,
        color: stateStyles.default.textColor,
        borderColor: stateStyles.default.borderColor,
        borderWidth: variant === 'outline' ? '2px' : '0px',
        boxShadow: variant === 'primary' && !isDisabled ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin">
            <IconScout 
              name="spinnerAlt" 
              size={currentIconSize}
              color={stateStyles.default.textColor}
            />
          </div>
        </div>
      )}
      
      <div className={`flex items-center ${hasAnyIcon ? 'gap-2' : ''} transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {hasLeftIcon && (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: currentIconSize,
              height: currentIconSize,
            }}
            aria-hidden={(!iconLeft).toString() as any}
          >
            {iconLeft && renderIcon(iconLeft)}
          </div>
        )}
        <div className="flex-1 text-center">
          <Text
            variant={textVariant ?? sizeConfig[size].text.variant}
            color="inherit"
            lineHeight="20px"
          >
            {children}
          </Text>
        </div>
        {hasRightIcon && (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: currentIconSize,
              height: currentIconSize,
            }}
            aria-hidden={(!iconRight).toString() as any}
          >
            {iconRight && renderIcon(iconRight)}
          </div>
        )}
      </div>
    </button>
  );
};

export default PrimaryButton;
