import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuNavButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isActive?: boolean;
  showDropdownIcon?: boolean;
}

export function MenuNavButton({
  children,
  icon,
  isActive = false,
  showDropdownIcon = true,
}: MenuNavButtonProps) {
  return (
    <span
      data-active={isActive}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'text-slate-700 hover:bg-slate-200/80',
        isActive && 'bg-slate-200 text-slate-900',
      )}
    >
      {icon}
      {children && <span>{children}</span>}
      {showDropdownIcon && <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden />}
    </span>
  );
}
