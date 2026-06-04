import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuSidebarItemProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  showArrow?: boolean;
  onClick?: () => void;
}

export function MenuSidebarItem({
  children,
  icon,
  showArrow = true,
  onClick,
}: MenuSidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium',
        'text-slate-100 hover:bg-slate-800 transition-colors',
      )}
    >
      {icon && <span className="shrink-0 opacity-90">{icon}</span>}
      <span className="flex-1">{children}</span>
      {showArrow && <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
    </button>
  );
}
