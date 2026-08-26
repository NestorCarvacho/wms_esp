import { Menu, User, ChevronDown } from 'lucide-react';
import { NavIcon } from '@/components/ui/buttons';
import { SearchBar, ThemeToggle, UserDropdown } from './';
import { Link } from 'react-router-dom';
import { appPath } from '@/routes/paths';
import { LogoWms } from '@/components/ui/images';
import { APP_NAME } from '@/config/appBrand';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';

interface ToolsBarProps {
  isUserMenuOpen: boolean;
  searchTerm: string;
  setIsUserMenuOpen: (open: boolean) => void;
  handleMobileMenuToggle: () => void;
  handleSearchChange: (term: string) => void;
  handleUserMenuClose: () => void;
  handleLogout: () => void;
  navigate: (path: string) => void;
  userName?: string;
}

const ToolsBar: React.FC<ToolsBarProps> = ({
  isUserMenuOpen,
  searchTerm,
  setIsUserMenuOpen,
  handleMobileMenuToggle,
  handleSearchChange,
  handleUserMenuClose,
  handleLogout,
  navigate,
  userName = 'Usuario',
}) => (
  <div className="max-w-full bg-card px-4">
    <div className="flex items-center justify-between top-nav-height gap-3">
      <div className="flex items-center gap-3 shrink-0">
        <NavIcon
          icon={<Menu className="h-5 w-5" />}
          onClick={handleMobileMenuToggle}
          className="mobile-menu-button lg:hidden"
        />

        <div
          className="hidden lg:block w-px h-6 bg-border"
          aria-hidden
        />

        <Link to={appPath()} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <LogoWms variant="solo" className="h-8 w-auto" alt={APP_NAME} />
          <span className="hidden sm:block text-sm font-semibold text-foreground">
            {APP_NAME}
          </span>
        </Link>
      </div>

      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />
        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center gap-1 rounded-[10px] p-2 transition-colors',
              'text-muted-foreground hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
            data-testid="user-menu-trigger"
          >
            <User className="h-5 w-5" />
            <ChevronDown className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72" data-testid="user-dropdown">
          <UserDropdown
            userName={userName}
            onEditProfile={() => {
              handleUserMenuClose();
              void navigate(appPath('/perfil'));
            }}
            onLogout={() => {
              handleUserMenuClose();
              handleLogout();
            }}
            onHelpCenter={() => {
              handleUserMenuClose();
              window.open('#', '_blank');
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </div>
  </div>
);

export default ToolsBar;
