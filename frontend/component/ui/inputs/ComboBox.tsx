/**
 * ComboBox WMS — shadcn Popover + Command
 * https://ui.shadcn.com/docs/components/combobox
 */
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/shadcn/button';
import { Label } from '@/components/ui/shadcn/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/shadcn/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/shadcn/popover';

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
  supportingText?: string;
  searchTokens?: string;
}

export interface ComboBoxProps {
  id?: string;
  label: string;
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  options: ComboBoxOption[];
  supportingText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
  supportingClassName?: string;
  name?: string;
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  menuClassName?: string;
  maxMenuHeight?: number;
  portal?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideChevron?: boolean;
  'data-testid'?: string;
}

function normalizeValue(value: string | string[] | undefined, multiple: boolean): string[] {
  if (value == null) return [];
  if (multiple) return Array.isArray(value) ? value : value ? [value] : [];
  const single = Array.isArray(value) ? value[0] : value;
  return single ? [single] : [];
}

export function ComboBox({
  id: idProp,
  label,
  value,
  defaultValue,
  onChange,
  options,
  supportingText,
  placeholder = 'Selecciona una opción',
  disabled = false,
  required = false,
  className = '',
  triggerClassName = '',
  labelClassName = '',
  supportingClassName = '',
  name,
  multiple = false,
  searchable = false,
  searchPlaceholder = 'Buscar…',
  menuClassName = '',
  maxMenuHeight = 280,
  onOpenChange,
  hideChevron = false,
  'data-testid': dataTestId,
}: ComboBoxProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<string[]>(() =>
    normalizeValue(value ?? defaultValue, multiple),
  );

  const selected = value !== undefined ? normalizeValue(value, multiple) : internal;

  useEffect(() => {
    if (value !== undefined) {
      setInternal(normalizeValue(value, multiple));
    }
  }, [value, multiple]);

  const setOpenState = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const commit = useCallback(
    (next: string[]) => {
      if (value === undefined) setInternal(next);
      if (multiple) {
        onChange?.(next);
      } else {
        onChange?.(next[0] ?? '');
      }
    },
    [multiple, onChange, value],
  );

  const selectedLabels = useMemo(() => {
    if (!selected.length) return '';
    const labels = selected
      .map((v) => options.find((o) => o.value === v)?.label ?? v)
      .filter(Boolean);
    return multiple ? labels.join(', ') : (labels[0] ?? '');
  }, [multiple, options, selected]);

  const toggleOption = (opt: ComboBoxOption) => {
    if (opt.disabled) return;
    if (multiple) {
      const has = selected.includes(opt.value);
      const next = has ? selected.filter((v) => v !== opt.value) : [...selected, opt.value];
      commit(next);
    } else {
      commit([opt.value]);
      setOpenState(false);
    }
  };

  const clearSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    commit([]);
    setOpenState(false);
  };

  const showLabel = label.trim().length > 0;

  return (
    <div className={cn('w-full', className)} data-testid={dataTestId}>
      {showLabel && (
        <Label htmlFor={id} className={cn('mb-1.5', labelClassName)}>
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={(next) => !disabled && setOpenState(next)}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            name={name}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'h-10 w-full justify-between font-normal',
              !selectedLabels && 'text-muted-foreground',
              triggerClassName,
            )}
          >
            <span className="truncate">{selectedLabels || placeholder}</span>
            <span className="flex shrink-0 items-center gap-1">
              {!multiple && selectedLabels && !disabled && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={clearSingle}
                  className="rounded p-0.5 text-muted-foreground hover:bg-muted"
                  aria-label="Limpiar"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              {!hideChevron && <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn('w-[var(--radix-popover-trigger-width)] p-0', menuClassName)}
          align="start"
        >
          <Command>
            {searchable && <CommandInput placeholder={searchPlaceholder} />}
            <CommandList style={{ maxHeight: maxMenuHeight }}>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={`${opt.label} ${opt.searchTokens ?? ''} ${opt.value}`}
                      disabled={opt.disabled}
                      onSelect={() => toggleOption(opt)}
                    >
                      <Check
                        className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                      <span className="flex flex-col">
                        <span>{opt.label}</span>
                        {opt.supportingText && (
                          <span className="text-xs text-muted-foreground">{opt.supportingText}</span>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {supportingText && (
        <p className={cn('mt-1 text-xs text-muted-foreground', supportingClassName)}>{supportingText}</p>
      )}
    </div>
  );
}

export default ComboBox;
