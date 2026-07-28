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
        'inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors',
        'text-muted-foreground hover:bg-[rgba(37,99,235,0.08)] hover:text-primary',
        isActive && 'bg-[rgba(37,99,235,0.12)] text-primary font-semibold',
      )}
    >
      {icon}
      {children && <span>{children}</span>}
      {showDropdownIcon && (
        <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
      )}
    </span>
  );
}
