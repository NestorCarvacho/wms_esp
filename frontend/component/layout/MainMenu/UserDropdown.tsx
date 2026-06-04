import { Bell, LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/shadcn/dropdown-menu';

interface UserDropdownProps {
  onEditProfile: () => void;
  onLogout: () => void;
  onHelpCenter: () => void;
  userName: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  onEditProfile,
  onLogout,
  onHelpCenter,
  userName,
}) => (
  <>
    <DropdownMenuLabel className="font-normal">
      <div className="flex items-center gap-3 py-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onEditProfile} className="cursor-pointer gap-3">
      <Settings className="h-4 w-4" />
      Editar perfil
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={onLogout}
      className="cursor-pointer gap-3 text-destructive focus:text-destructive"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={onHelpCenter} className="cursor-pointer gap-3">
      <Bell className="h-4 w-4" />
      Centro de ayuda
    </DropdownMenuItem>
  </>
);

export default UserDropdown;
