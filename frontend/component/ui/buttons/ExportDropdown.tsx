import { ChevronDown, Loader2 } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { Button } from '@/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';

export interface ExportDropdownOption {
  id: string;
  label: string;
}

export interface ExportDropdownProps {
  triggerLabel?: string;
  options: ExportDropdownOption[];
  activeOptionId?: string | null;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function ExportDropdown({
  triggerLabel = 'Exportar',
  options,
  activeOptionId = null,
  onSelect,
  disabled = false,
}: ExportDropdownProps) {
  if (options.length === 0) return null;

  const isBusy = activeOptionId != null;

  if (options.length === 1) {
    return (
      <PrimaryButton
        type="button"
        variant="outline"
        isLoading={activeOptionId === options[0].id}
        disabled={disabled || isBusy}
        onClick={() => onSelect(options[0].id)}
      >
        {options[0].label}
      </PrimaryButton>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isBusy}
          className="rounded-full font-medium gap-1.5"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {triggerLabel}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[11rem]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className="cursor-pointer"
            disabled={isBusy}
            onSelect={() => onSelect(option.id)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
