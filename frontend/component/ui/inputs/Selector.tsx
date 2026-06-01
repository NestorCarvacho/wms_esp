import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  KeyboardEvent,
  useMemo,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { IconScout } from '@/components/ui/images/IconScout';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';
import type { TextVariant } from '@/components/ui/text/Text';
import { Card } from '@/components/ui/cards/Card';
import { LabelInput } from '@/components/ui/inputs/LabelInput';
import { Checkbox } from '@/components/ui/inputs/Checkbox';


type SelectorColor = 'default' | 'important' | 'success' | 'alert' | 'error';

export interface SelectorOption {
  value: string;
  label: string;
  disabled?: boolean;
  supportingText?: string;
  searchTokens?: string;
}

export interface SelectorProps {
	id?: string;
	label: string;
	value?: string | string[];
	defaultValue?: string | string[];
	onChange?: (value: string | string[]) => void;
	options: SelectorOption[];
	supportingText?: string;
	placeholder?: string;
	color?: SelectorColor;
	disabled?: boolean;
	required?: boolean;
	className?: string;
	selectClassName?: string;
	labelClassName?: string;
	supportingClassName?: string;
	name?: string;
	multiple?: boolean;
	searchable?: boolean;
	searchPlaceholder?: string;
	menuClassName?: string;
	optionClassName?: string;
	maxMenuHeight?: number;
	portal?: boolean;
  renderOption?: (option: SelectorOption, active: boolean, selected: boolean) => React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  TextVariant?: TextVariant;
  hideChevron?: boolean;
  'data-testid'?: string;
}const colorTokens: Record<Exclude<SelectorColor, 'default'>, string> = {
  important: colors.important.main,
  success: colors.feedback.success300,
  alert: colors.feedback.alert300,
  error: colors.feedback.error300,
};

function getSelectorColors(args: {
  variant: SelectorColor;
  disabled: boolean;
  focused: boolean;
  open: boolean;
}) {
  const { variant, disabled, focused, open } = args;
  if (disabled) {
    return {
      label: colors.grays.neutral99,
      supporting: colors.grays.neutral99,
      body: colors.grays.neutral99,
      border: colors.grays.neutralE5,
      icon: colors.grays.neutral99,
    } as const;
  }
  if (variant === 'default') {
    const activeBorder = (focused || open)
      ? colors.important.main
      : colors.grays.neutralE5;
    return {
      label: colors.grays.neutral66,
      supporting: colors.grays.neutral99,
      body: colors.grays.neutral33,
      border: activeBorder,
      icon: colors.important.main,
    } as const;
  }
  const variantColor = colorTokens[variant];
  return {
    label: variantColor,
    supporting: variantColor,
    body: colors.grays.neutral33,
    border: variantColor,
    icon: variantColor,
  } as const;
}

export const Selector: React.FC<SelectorProps> = ({
  id,
  label,
  value,
  defaultValue,
  onChange,
  options,
  supportingText,
  placeholder = 'Selecciona una opción',
  color = 'default',
  disabled = false,
  required = false,
  className = '',
  selectClassName = '',
  labelClassName = '',
  'data-testid': dataTestId,
  supportingClassName = '',
  name,
  multiple = false,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  menuClassName = '',
  optionClassName = '',
  maxMenuHeight = 260,
  portal = false,
  renderOption,
  onOpenChange,
  TextVariant = 'body-regular',
  hideChevron = false,
}) => {
  const generatedId = useId();
  const baseId = id || generatedId;
  const isMultiple = !!multiple;
  const isControlled = isMultiple ? Array.isArray(value) : typeof value === 'string';

  const getInitialSingleValue = () => (
    !isMultiple && typeof defaultValue === 'string' ? defaultValue : undefined
  );
  const getInitialMultipleValues = () => {
    if (!isMultiple) return [] as string[];
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof defaultValue === 'string') return [defaultValue];
    return [] as string[];
  };

  const [internalValue, setInternalValue] = useState<string | undefined>(getInitialSingleValue);
  const [internalValues, setInternalValues] = useState<string[]>(getInitialMultipleValues);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [portalStyle, setPortalStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [openDirection, setOpenDirection] = useState<'down' | 'up'>('down');
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Shared: compute dropdown position and direction based on trigger rect and viewport
  const computePosition = useCallback((optionsCount: number): {
    direction: 'down' | 'up';
    top: number;
    left: number;
    width: number;
  } | null => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Estimate menu height based on actual content
    const OPTION_HEIGHT = 38; // Average option height in px
    const SEARCH_BAR_HEIGHT = searchable ? 60 : 0;
    const MENU_PADDING = 16;
    const MIN_MENU_HEIGHT = OPTION_HEIGHT + MENU_PADDING + SEARCH_BAR_HEIGHT;
    
    const estimatedContentHeight = 
      (optionsCount * OPTION_HEIGHT) + 
      SEARCH_BAR_HEIGHT + 
      MENU_PADDING;
    
    const estimatedMenuHeight = Math.max(
      MIN_MENU_HEIGHT,
      Math.min(estimatedContentHeight, maxMenuHeight ?? 260),
    );
    
    // Prioritize fitting: if fits below → down, if fits above → up, otherwise choose larger space
    let direction: 'down' | 'up';
    if (spaceBelow >= estimatedMenuHeight) {
      direction = 'down';
    } else if (spaceAbove >= estimatedMenuHeight) {
      direction = 'up';
    } else {
      direction = spaceBelow >= spaceAbove ? 'down' : 'up';
    }
    
    return {
      direction,
      top: (direction === 'down' ? rect.bottom : rect.top) + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    };
  }, [maxMenuHeight, searchable]);

  const currentValue = !isMultiple
    ? (isControlled ? (value as string) : internalValue)
    : undefined;
  const selectedValues = useMemo<string[]>(() => {
    if (isMultiple) {
      if (isControlled) {
        return ((value as string[]) || []);
      }
      return internalValues;
    }
    return currentValue ? [currentValue] : [];
  }, [isMultiple, isControlled, value, internalValues, currentValue]);

  const {
    label: labelColor,
    supporting: supportingColor,
    body: bodyColor,
    border: borderColor,
    icon: iconColor,
  } = getSelectorColors({
    variant: color,
    disabled,
    focused: isFocused,
    open,
  });

  const filtered = search
    ? options.filter((option) => {
      const query = search.toLowerCase();
      const haystack = `${option.label}\n${option.supportingText ?? ''}\n${option.searchTokens ?? ''}`.toLowerCase();
      return haystack.includes(query);
    })
    : options;
  const focusSelectedIndex = filtered.findIndex((option) => selectedValues.includes(option.value));

  const toggleValue = useCallback((val: string) => {
    if (isMultiple) {
      const exists = selectedValues.includes(val);
      const next = exists
        ? selectedValues.filter((selectedValue) => selectedValue !== val)
        : [...selectedValues, val];
      if (!isControlled) {
        setInternalValues(next);
      }
      onChange?.(next);
    } else {
      if (!isControlled) setInternalValue(val);
      onChange?.(val);
      setOpen(false);
      onOpenChange?.(false);
      setSearch('');
      triggerRef.current?.focus();
    }
  }, [isMultiple, selectedValues, isControlled, onChange, onOpenChange]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    onOpenChange?.(true);
    setIsFocused(true);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerWidth(rect.width);
    }
    // Calculate position based on current filtered options count at open time
    const currentFiltered = search
      ? options.filter((option) => {
        const query = search.toLowerCase();
        const haystack = `${option.label}\n${option.supportingText ?? ''}\n${option.searchTokens ?? ''}`.toLowerCase();
        return haystack.includes(query);
      })
      : options;
    
    const computed = computePosition(currentFiltered.length);
    if (computed) {
      setOpenDirection(computed.direction);
      if (portal) setPortalStyle({ top: computed.top, left: computed.left, width: computed.width });
    }
  }, [disabled, onOpenChange, portal, computePosition, search, options]);

  // Gestionar foco tras apertura sin usar setTimeout
  useLayoutEffect(() => {
    if (!open) return;
    if (searchable) {
      const searchInput = document.getElementById(`${baseId}-search`) as HTMLInputElement | null;
      searchInput?.focus();
    } else if (listRef.current) {
      const initialIndex = focusSelectedIndex >= 0 ? focusSelectedIndex : 0;
      setActiveIndex(initialIndex);
      listRef.current.querySelector<HTMLElement>(`[data-idx="${initialIndex}"]`)?.focus();
    }
  }, [open, searchable, baseId, focusSelectedIndex]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
    setActiveIndex(-1);
    setIsFocused(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (triggerRef.current?.contains(event.target as Node)) return;
      if (listRef.current?.parentElement?.contains(event.target as Node)) return;
      closeMenu();
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    const handleReposition = () => {
      // Recalculate filtered length at reposition time
      const currentFiltered = search
        ? options.filter((option) => {
          const query = search.toLowerCase();
          const haystack = `${option.label}\n${option.supportingText ?? ''}\n${option.searchTokens ?? ''}`.toLowerCase();
          return haystack.includes(query);
        })
        : options;
      
      const computed = computePosition(currentFiltered.length);
      if (!computed) return;
      setOpenDirection(computed.direction);
      if (portal) setPortalStyle({ top: computed.top, left: computed.left, width: computed.width });
    };
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition);
    };
  }, [open, closeMenu, portal, computePosition, search, options]);

  const handleTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      if (open) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  };

  const moveActive = (delta: number) => {
    if (!filtered.length) return;
    let next = activeIndex;
    if (next === -1) next = focusSelectedIndex >= 0 ? focusSelectedIndex : 0;
    next = (next + delta + filtered.length) % filtered.length;
    setActiveIndex(next);
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${next}"]`)?.focus();
  };

  const handleListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        e.preventDefault();
        if (filtered.length) {
          setActiveIndex(0);
          listRef.current
            ?.querySelector<HTMLElement>('[data-idx="0"]')
            ?.focus();
        }
        break;
      case 'End':
        e.preventDefault();
        if (filtered.length) {
          const last = filtered.length - 1;
          setActiveIndex(last);
          listRef.current
            ?.querySelector<HTMLElement>(`[data-idx="${last}"]`)
            ?.focus();
        }
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (
          activeIndex >= 0 &&
          filtered[activeIndex] &&
          !filtered[activeIndex].disabled
        ) {
          toggleValue(filtered[activeIndex].value);
        }
        break;
      }
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu();
        break;
    }
  };

  useEffect(() => { setActiveIndex(-1); }, [search]);

  // Border radius based on open direction
  const borderRadiusStyle = openDirection === 'down'
    ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 }
    : { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 };

  // Transform for upward opening (portal mode)
  const portalTransformStyle = openDirection === 'up' ? { transform: 'translateY(-100%)' } : {};

  // list overlay
  const listContent = (
    <Card
      elevation={2}
      className={`w-full p-0 ${menuClassName}`}
      style={{
        maxWidth: '100%',
        zIndex: 100,
        ...borderRadiusStyle,
        ...(portal && portalStyle
          ? {
            position: 'absolute',
            top: portalStyle.top,
            left: portalStyle.left,
            minWidth: portalStyle.width,
            width: 'max-content',
            ...portalTransformStyle,
          }
          : {}),
      }}
    >
      {searchable && (
        <div className="px-1 py-2">
          <LabelInput
            id={`${baseId}-search`}
            variant="standard"
            size="sm"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(val) => setSearch(val)}
            iconRight={<IconScout name="search" />}
            className="mb-0"
            inputClassName="!border-0 !border-b !rounded-none"
          />
        </div>
      )}
      <ul
        id={`${baseId}-listbox`}
        ref={listRef}
        role="listbox"
        aria-labelledby={baseId}
        {...(isMultiple ? { 'aria-multiselectable': true } : {})}
        tabIndex={-1}
        onKeyDown={handleListKey}
        className={`overflow-auto outline-none focus:outline-none ${optionClassName}`}
        style={{ maxHeight: maxMenuHeight }}
      >
        {filtered.length === 0 && (
          <li className="px-4 py-2 select-none" aria-disabled="true">
            <Text variant="body-regular" color={colors.primary.main}>Sin resultados</Text>
          </li>
        )}
        {filtered.map((option, index) => {
          const selected = selectedValues.includes(option.value);
          const active = index === activeIndex;
          const baseColor = option.disabled ? colors.grays.neutral99 : colors.primary.main;
          let background: string;
          if (selected) {
            background = colors.primary.dash;
          } else if (active) {
            background = colors.primary.background200;
          } else {
            background = 'transparent';
          }
          const textColor = selected ? colors.grays.neutralFF : baseColor;

          const defaultOptionContent = (
            <>
              {isMultiple && (
                <span className="pt-0.5">
                  <Checkbox
                    checked={selected}
                    onChange={() => toggleValue(option.value)}
                    disabled={option.disabled}
                    className="!m-0"
                    boxClassName="!m-0"
                  />
                </span>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <Text
                  variant={TextVariant}
                  className="truncate"
                  color={textColor}
                >
                  {option.label}
                </Text>
                {option.supportingText && (
                  <Text
                    variant="small-regular"
                    color={selected ? colors.grays.neutralFF : colors.grays.neutral66}
                  >
                    {option.supportingText}
                  </Text>
                )}
              </div>
            </>
          );

          return (
            <li
              key={option.value}
              id={`${baseId}-opt-${index}`}
              role="option"
              aria-selected={selected}
              data-idx={index}
              tabIndex={-1}
              onClick={() => { if (!option.disabled) toggleValue(option.value); }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`px-4 py-2 flex items-start gap-2 border-b last:border-b-0 ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                backgroundColor: background,
                color: textColor,
                borderColor: colors.primary.background100,
              }}
            >
              {renderOption ? renderOption(option, active, selected) : defaultOptionContent}
            </li>
          );
        })}
      </ul>
    </Card>
  );

  const dropdownNode = portal
    ? (open && createPortal(listContent, document.body))
    : (open && (
      <div
        className="absolute left-0"
        style={{
          zIndex: 100,
          minWidth: triggerWidth ?? undefined,
          width: 'max-content',
          top: openDirection === 'down' ? '100%' as const : undefined,
          bottom: openDirection === 'up' ? '100%' as const : undefined,
        }}
      >
        {listContent}
      </div>
    ));

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between">
        <Text
          variant="small-regular"
          color={labelColor}
          className={labelClassName}
        >
          {label}{required && <span className="ml-1" style={{ color: colors.feedback.error300 }}>*</span>}
        </Text>
      </div>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          id={baseId}
          name={name}
          data-testid={dataTestId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? `${baseId}-listbox` : undefined}
          aria-multiselectable={isMultiple || undefined}
          disabled={disabled}
          onClick={() => (open ? closeMenu() : openMenu())}
          onKeyDown={handleTriggerKey}
          className={`w-full min-w-0 text-left pr-8 pb-[7px] pt-[6px] bg-transparent outline-none border-b ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          } transition-colors ${selectClassName}`}
          style={{
					  borderBottomColor: borderColor,
					  borderBottomWidth: 1,
					  borderBottomStyle: 'solid',
					  color: bodyColor,
          }}
        >
          {(() => {
            if (isMultiple) {
              if (selectedValues.length === 0) {
                return (
                  <span style={{ color: colors.grays.neutral99 }}>
                    {placeholder}
                  </span>
                );
              }
              const suffix = selectedValues.length > 1 ? 's' : '';
              return `${selectedValues.length} seleccionada${suffix}`;
            }
            if (currentValue) {
              const match = options.find(option => option.value === currentValue);
              return match ? (
                <span className="block truncate pr-1 min-w-0" title={match.label}>
                  {match.label}
                </span>
              ) : (
                <span style={{ color: colors.grays.neutral99 }}>
                  {placeholder}
                </span>
              );
            }
            return (
              <span style={{ color: colors.grays.neutral99 }}>
                {placeholder}
              </span>
            );
          })()}
        </button>
        {!hideChevron && !disabled && (
          <div
            className="absolute right-0 top-0 h-full flex items-end pb-1 pointer-events-none"
            aria-hidden="true"
          >
            <IconScout name="angleDown" size="lg" color={iconColor} />
          </div>
        )}
        {dropdownNode}
      </div>
      {supportingText && (
        <Text variant="small-regular" className={`mt-1 ${supportingClassName}`} color={supportingColor}>
          {supportingText}
        </Text>
      )}
    </div>
  );
};

export default Selector;
