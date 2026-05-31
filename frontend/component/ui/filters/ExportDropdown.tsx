import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '@/components/ui/buttons/LinkButton';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { Card } from '@/components/ui/cards/Card';


export type ExportFormat = 'EXCEL' | 'PDF' | 'WORD';

export interface ExportOption {
  format: ExportFormat;
  label: string;
  customVariant: {
    default: { backgroundColor: string; textColor: string; borderColor: string };
    hover: { backgroundColor: string; textColor: string; borderColor: string };
    pressed: { backgroundColor: string; textColor: string; borderColor: string };
    focus: { backgroundColor: string; textColor: string; borderColor: string };
  };
}

export interface ExportDropdownProps {
  className?: string;
  cardClassName?: string;
  onExport: (format: ExportFormat) => void;
  placement?: 'left' | 'right';
  closeOnOutsideClick?: boolean;
  closeOnSelect?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

const DEFAULT_EXPORT_OPTIONS: ExportOption[] = [
  {
    format: 'EXCEL',
    label: 'Excel',
    customVariant: {
      default: { backgroundColor: 'transparent', textColor: '#4CAF50', borderColor: '#4CAF50' },
      hover: { backgroundColor: 'rgba(76, 175, 80, 0.08)', textColor: '#4CAF50', borderColor: '#4CAF50' },
      pressed: { backgroundColor: 'rgba(76, 175, 80, 0.15)', textColor: '#4CAF50', borderColor: '#4CAF50' },
      focus: { backgroundColor: 'transparent', textColor: '#4CAF50', borderColor: '#4CAF50' },
    },
  },
  {
    format: 'PDF',
    label: 'PDF',
    customVariant: {
      default: { backgroundColor: 'transparent', textColor: '#FF6B6B', borderColor: '#FF6B6B' },
      hover: { backgroundColor: 'rgba(255, 107, 107, 0.08)', textColor: '#FF6B6B', borderColor: '#FF6B6B' },
      pressed: { backgroundColor: 'rgba(255, 107, 107, 0.15)', textColor: '#FF6B6B', borderColor: '#FF6B6B' },
      focus: { backgroundColor: 'transparent', textColor: '#FF6B6B', borderColor: '#FF6B6B' },
    },
  },
  {
    format: 'WORD',
    label: 'Word',
    customVariant: {
      default: { backgroundColor: 'transparent', textColor: '#5E9FD6', borderColor: '#5E9FD6' },
      hover: { backgroundColor: 'rgba(94, 159, 214, 0.08)', textColor: '#5E9FD6', borderColor: '#5E9FD6' },
      pressed: { backgroundColor: 'rgba(94, 159, 214, 0.15)', textColor: '#5E9FD6', borderColor: '#5E9FD6' },
      focus: { backgroundColor: 'transparent', textColor: '#5E9FD6', borderColor: '#5E9FD6' },
    },
  },
];

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
  className = '',
  cardClassName = '',
  onExport,
  placement = 'right',
  closeOnOutsideClick = true,
  closeOnSelect = true,
  disabled = false,
  isLoading = false,
}) => {
  const { t: translate } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const toggle = useCallback(() => {
    if (disabled || isLoading) return;
    setOpen(previous => !previous);
  }, [disabled, isLoading]);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleToggleClick = useCallback(() => {
    toggle();
    // Remove focus from trigger button after click using setTimeout to ensure DOM is ready
    setTimeout(() => {
      if (triggerRef.current) {
        const button = triggerRef.current.querySelector('button');
        button?.blur();
      }
    }, 0);
  }, [toggle]);

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

  const handleExportClick = useCallback((format: 'EXCEL' | 'PDF' | 'WORD') => {
    onExport(format);
    if (closeOnSelect) {
      close();
    }
  }, [onExport, closeOnSelect, close]);

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      <LinkButton
        iconLeft="import"
        onClick={handleToggleClick}
        disabled={disabled || isLoading}
        className="focus:outline-none focus:ring-0 [&:focus]:!shadow-none"
      >
        {translate('attendance:monthly.actions.export')}
      </LinkButton>

      {open && (
        <div
          ref={cardRef}
          className={`absolute mt-2 z-50 min-w-[200px] ${placement === 'right' ? 'right-0' : 'left-0'}`}
        >
          <Card className={`flex flex-col gap-2 ${cardClassName}`} padding="16px">
            <div className="flex flex-col gap-2">
              {DEFAULT_EXPORT_OPTIONS.map((option) => (
                <PrimaryButton
                  key={option.format}
                  onClick={() => handleExportClick(option.format)}
                  variant="outline"
                  customVariant={option.customVariant}
                  fullWidth
                  className="!rounded-[12px]"
                  textVariant="body-medium"
                >
                  {option.label}
                </PrimaryButton>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
