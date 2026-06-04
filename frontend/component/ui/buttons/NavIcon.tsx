import React from 'react';
import { cn } from '@/lib/utils';

interface NavIconProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  showNotification?: boolean;
  notificationCount?: number;
  disabled?: boolean;
}

const NavIcon: React.FC<NavIconProps> = ({
  icon,
  onClick,
  className = '',
  showNotification = false,
  notificationCount,
  disabled = false,
}) => (
  <div className="relative">
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-2 transition-colors',
        'text-slate-200 hover:bg-slate-800 hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
      )}
    >
      {icon}
    </button>

    {showNotification && (
      <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-400 px-1 text-[9px] font-semibold text-slate-900">
        {notificationCount && notificationCount > 99 ? '99+' : notificationCount}
      </span>
    )}
  </div>
);

export default NavIcon;
