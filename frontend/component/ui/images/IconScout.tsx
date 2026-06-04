/**
 * Iconos vía lucide-react (MIT). Reemplaza @iconscout/react-unicons por licencia/copyright.
 * Mantiene la API `name` / `size` usada en el WMS.
 */
import React from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Cpu,
  Cog,
  Download,
  Eye,
  EyeOff,
  File,
  FileQuestion,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  Home,
  Info,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Table,
  Trash2,
  Upload,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  angleDown: ChevronDown,
  angleUp: ChevronUp,
  angleLeft: ChevronLeft,
  angleRight: ChevronRight,
  arrowLeft: ArrowLeft,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  bars: Menu,
  bell: Bell,
  building: Building2,
  calendarAlt: Calendar,
  chart: BarChart3,
  check: Check,
  checkCircle: CheckCircle,
  clockThree: Clock,
  cog: Cog,
  copy: Copy,
  documentInfo: FileText,
  edit: Pencil,
  export: Download,
  eye: Eye,
  eyeSlash: EyeOff,
  fileAlt: File,
  fileInfo: FileQuestion,
  folderOpen: FolderOpen,
  table: Table,
  trash: Trash2,
  graduationCap: GraduationCap,
  home: Home,
  import: Upload,
  close: X,
  alert: AlertTriangle,
  info: Info,
  plus: Plus,
  more: MoreHorizontal,
  filter: Filter,
  layers: Layers,
  lock: Lock,
  processor: Cpu,
  robot: Bot,
  search: Search,
  setting: Settings,
  signout: LogOut,
  spinnerAlt: Loader2,
  sync: RefreshCw,
  user: User,
  usersAlt: Users,
};

export type IconScoutName = keyof typeof ICONS;

export type IconScoutSizeToken = number | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<string, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 40,
};

const DEFAULT_SIZE = 16;

export interface IconScoutProps {
  name: IconScoutName;
  size?: IconScoutSizeToken;
  color?: string;
  className?: string;
  'data-testid'?: string;
}

export const IconScout: React.FC<IconScoutProps> = ({
  name,
  size = DEFAULT_SIZE,
  color,
  className,
  'data-testid': dataTestId,
}) => {
  const Component = ICONS[name];
  if (!Component) return null;
  const resolvedSize = typeof size === 'string' ? (SIZE_MAP[size] ?? DEFAULT_SIZE) : size;
  const isSpinner = name === 'spinnerAlt';

  return (
    <Component
      size={resolvedSize}
      color={color}
      className={cn(isSpinner && 'animate-spin', className)}
      data-testid={dataTestId ?? `icon-${name}`}
      aria-hidden
    />
  );
};

export const iconScoutNames = Object.keys(ICONS) as IconScoutName[];
