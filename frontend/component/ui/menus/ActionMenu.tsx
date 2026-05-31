import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/cards/Card';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';
import { Text } from '@/components/ui/text/Text';
import { colors } from '@/assets/styles/colors';


export interface ActionMenuItem {
  id: string;
  label: string;
  icon: IconScoutName;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  dividerAfter?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: IconScoutName;
  triggerColor?: string;
  triggerSize?: number;
  placement?: 'left' | 'right';
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  triggerIcon = 'more',
  triggerColor = colors.important.main,
  triggerSize = 24,
  placement = 'right',
  ariaLabel = 'Opciones',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: placement === 'left' 
          ? rect.left 
          : rect.right,
      });
    }
  }, [placement]);

  const toggle = useCallback(() => {
    if (!disabled) {
      if (!isOpen) {
        updatePosition();
      }
      setIsOpen((previous) => !previous);
    }
  }, [disabled, isOpen, updatePosition]);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen || !menuRef.current || !triggerRef.current) return;
    
    const menuWidth = menuRef.current.offsetWidth;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    
    setPosition({
      top: triggerRect.bottom + 4,
      left: placement === 'left'
        ? triggerRect.left
        : triggerRect.right - menuWidth,
    });
  }, [isOpen, placement]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    
    const handleScroll = () => {
      close();
    };
    
    const handleResize = () => {
      close();
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, close]);

  const handleItemClick = useCallback(
    (item: ActionMenuItem) => {
      if (item.disabled) return;
      item.onClick();
      close();
    },
    [close],
  );

  const menuContent = isOpen ? (
    <div
      ref={menuRef}
      className="fixed z-[9999]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: '150px',
      }}
      data-testid="action-menu-dropdown"
    >
      <Card padding="0px" borderRadius="10px" elevation={1}>
        <ul role="menu" className="flex flex-col gap-1">
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded
                    transition-colors text-left
                    ${
                      item.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 cursor-pointer'
                    }
                  `}
                  data-testid={`action-menu-item-${item.id}`}
                >
                  <IconScout
                    name={item.icon}
                    size="md"
                    color={
                      item.disabled
                        ? colors.grays.neutral99
                        : (item.color || colors.grays.neutral33)
                    }
                  />
                  <Text
                    variant="body-regular"
                    color={item.disabled ? colors.grays.neutral99 : colors.grays.neutral33}
                  >
                    {item.label}
                  </Text>
                </button>
              </li>
              {item.dividerAfter && index < items.length - 1 && (
                <li role="separator" className="my-1">
                  <div className="h-px bg-gray-200" />
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </Card>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        data-testid="action-menu-trigger"
      >
        <IconScout name={triggerIcon} size={triggerSize} color={triggerColor} />
      </button>
      {menuContent && createPortal(menuContent, document.body)}
    </>
  );
};

export default ActionMenu;
