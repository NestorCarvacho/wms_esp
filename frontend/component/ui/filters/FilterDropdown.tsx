import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colorClass, palette } from '@/assets/styles/colors';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { IconScout } from '@/components/ui/images/IconScout';
import { LocalIcon } from '@/components/ui/images/LocalIcon';
import { Card } from '@/components/ui/cards/Card';
import { ComboBox, ComboBoxProps } from '@/components/ui/inputs/ComboBox';
import { Text } from '@/components/ui/text/Text';


export interface SimpleFilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SimpleFilter {
  key: string;
  label: string;
  options: SimpleFilterOption[];
  multiple?: boolean;
  placeholder?: string;
  supportingText?: string;
  defaultValue?: string | string[];
  hide?: boolean;
}

export interface FilterDropdownProps {
	className?: string;
	cardClassName?: string;
	filters?: SimpleFilter[]; 
	extraFilters?: React.ReactNode;
	values?: Record<string, string | string[] | undefined>;
	onChangeFilter?: (key: string, value: string | string[]) => void;
	placement?: 'left' | 'right';
	closeOnOutsideClick?: boolean;
	closeOnSelect?: boolean;
	onOpenChange?: (open: boolean) => void;
  onAnyFilterChange?: () => void;
  autoApplyDefaultValues?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  className = '',
  cardClassName = '',
  filters,
  extraFilters,
  values,
  onChangeFilter,
  placement = 'left',
  closeOnOutsideClick = true,
  closeOnSelect = false,
  onOpenChange,
  onAnyFilterChange,
  autoApplyDefaultValues = true,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [internalValues, setInternalValues] = useState<
    Record<string, string | string[] | undefined>
  >({});
  const mergedValues = values || internalValues;

  const toggle = useCallback(() => {
    setOpen(o => {
      const next = !o;
      onOpenChange?.(next);
      return next;
    });
  }, [onOpenChange]);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open || !closeOnOutsideClick) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return; 
      if (cardRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeOnOutsideClick, close]);

  const handleComboBoxChange = useCallback<NonNullable<ComboBoxProps['onChange']>>(
    () => {
      if (closeOnSelect) close();
    },
    [closeOnSelect, close],
  );

  const buttonBg = palette.brandBg;
  const rightIconColor = palette.accent;

  // Auto-apply default values once on mount if uncontrolled and feature enabled
  useEffect(() => {
    if (!autoApplyDefaultValues || !filters?.length || values) return; // skip if controlled
    setInternalValues(prev => {
      const next = { ...prev };
      let changed = false;
      for (const f of filters) {
        if (f.defaultValue !== undefined && next[f.key] === undefined) {
          next[f.key] = f.defaultValue as any;
          changed = true;
          onChangeFilter?.(f.key, f.defaultValue as any);
          onAnyFilterChange?.();
        }
      }
      return changed ? next : prev;
    });
    // only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtersNode = filters?.length ? (
    <div className="flex flex-col gap-4">
      {filters.filter(filter => !filter.hide).map(filter => {
			  const value = mergedValues[filter.key];
			  return (
  <ComboBox
    key={filter.key}
    label={filter.label}
    options={filter.options}
    multiple={filter.multiple}
    placeholder={filter.placeholder}
    supportingText={filter.supportingText}
    defaultValue={filter.defaultValue}
    value={value}
    onChange={(val) => {
      if (!values) {
        setInternalValues(prev => ({ ...prev, [filter.key]: val }));
      }
      onChangeFilter?.(filter.key, val);
      onAnyFilterChange?.();
      handleComboBoxChange(val);
    }}
  />
			  );
      })}
    </div>
  ) : null;

  const contentBody = (filtersNode || extraFilters) ? (
    <div className="flex flex-col gap-4">
      {extraFilters}
      {filtersNode}
    </div>
  ) : (
    <Text variant="subheader-regular" className={colorClass.muted} as="span">
      Sin filtros configurados
    </Text>
  );

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      <PrimaryButton
        customVariant={{
          default: {
            backgroundColor: buttonBg,
            textColor: palette.brandLight,
          },
          hover: {
            backgroundColor: palette.brandBg,
            textColor: palette.brandLight,
          },
          pressed: {
            backgroundColor: palette.brandBg200,
            textColor: palette.brandLight,
          },
          focus: {
            backgroundColor: palette.brandBg,
            textColor: palette.brandLight,
          },
        }}
        iconLeft={<LocalIcon name="filter" className="!w-5 !h-5"/>}
        iconRight={<IconScout name="angleDown" color={rightIconColor} size={20} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
        onClick={toggle}
        className="!rounded-[16px]"
        textVariant="subheader-regular"
      >
        Filtros
      </PrimaryButton>

      {open && (
        <div
          ref={cardRef}
          className={`absolute mt-2 z-50 min-w-[290px] ${placement === 'right' ? 'right-0' : 'left-0'}`}
        >
          <Card className={`flex flex-col gap-2 ${cardClassName}`} padding="16px">
            <Text variant="subheader-regular" className={colorClass.brandLight} as="span">Filtros</Text>
            {contentBody}
          </Card>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
