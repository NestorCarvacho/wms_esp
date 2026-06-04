import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';
import { Button } from '@/components/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: IconScoutName;
  onClick: () => void;
  /** @deprecated Use `variant` */
  color?: string;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  dividerAfter?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: IconScoutName;
  placement?: 'left' | 'right';
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

function itemVariant(item: ActionMenuItem): 'default' | 'destructive' {
  if (item.variant) return item.variant;
  if (item.color && /ef5350|e53935|c62828|error/i.test(item.color)) {
    return 'destructive';
  }
  return 'default';
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  placement = 'right',
  ariaLabel = 'Opciones',
  disabled = false,
  className = '',
}) => {
  if (items.length === 0) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            'h-8 w-8 text-orange-600 hover:bg-slate-100 hover:text-orange-700',
            className,
          )}
          data-testid="action-menu-trigger"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={placement === 'left' ? 'start' : 'end'}
        sideOffset={4}
        className="min-w-[10rem]"
        data-testid="action-menu-dropdown"
      >
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <DropdownMenuItem
              disabled={item.disabled}
              variant={itemVariant(item)}
              className="cursor-pointer gap-2"
              onSelect={() => item.onClick()}
              data-testid={`action-menu-item-${item.id}`}
            >
              <IconScout
                name={item.icon}
                size="md"
                color="currentColor"
                className={cn(
                  item.disabled && 'opacity-50',
                  itemVariant(item) === 'destructive' && 'text-destructive',
                )}
              />
              <span>{item.label}</span>
            </DropdownMenuItem>
            {item.dividerAfter && index < items.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;
