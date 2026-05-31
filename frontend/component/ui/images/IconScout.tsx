import React from 'react';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
import UilBell from '@iconscout/react-unicons/icons/uil-bell';
import UilSetting from '@iconscout/react-unicons/icons/uil-setting';
import UilSync from '@iconscout/react-unicons/icons/uil-sync';
import UilBuilding from '@iconscout/react-unicons/icons/uil-building';
import UilChart from '@iconscout/react-unicons/icons/uil-chart';
import UilProcessor from '@iconscout/react-unicons/icons/uil-processor';
import UilCog from '@iconscout/react-unicons/icons/uil-cog';
import UilAngleDown from '@iconscout/react-unicons/icons/uil-angle-down';
import UilAngleUp from '@iconscout/react-unicons/icons/uil-angle-up';
import UilArrowLeft from '@iconscout/react-unicons/icons/uil-arrow-left';
import UilArrowUp from '@iconscout/react-unicons/icons/uil-arrow-up';
import UilArrowDown from '@iconscout/react-unicons/icons/uil-arrow-down';
import UilCheckCircle from '@iconscout/react-unicons/icons/uil-check-circle';
import UilUsersAlt from '@iconscout/react-unicons/icons/uil-users-alt';
import UilGraduationCap from '@iconscout/react-unicons/icons/uil-graduation-cap';
import UilFileAlt from '@iconscout/react-unicons/icons/uil-file-alt';
import UilFolderOpen from '@iconscout/react-unicons/icons/uil-folder-open';
import UilExport from '@iconscout/react-unicons/icons/uil-export';
import UilImport from '@iconscout/react-unicons/icons/uil-import';
import UilRobot from '@iconscout/react-unicons/icons/uil-robot';
import UilCalendarAlt from '@iconscout/react-unicons/icons/uil-calendar-alt';
import UilLock from '@iconscout/react-unicons/icons/uil-lock';
import UilSearch from '@iconscout/react-unicons/icons/uil-search';
import UilAngleLeft from '@iconscout/react-unicons/icons/uil-angle-left';
import UilAngleRight from '@iconscout/react-unicons/icons/uil-angle-right';
import UilBars from '@iconscout/react-unicons/icons/uil-bars';
import UilFileInfoAlt from '@iconscout/react-unicons/icons/uil-file-info-alt';
import UilClockThree from '@iconscout/react-unicons/icons/uil-clock-three';
import UilLayers from '@iconscout/react-unicons/icons/uil-layers';
import UilEye from '@iconscout/react-unicons/icons/uil-eye';
import UilEyeSlash from '@iconscout/react-unicons/icons/uil-eye-slash';
import UilSignout from '@iconscout/react-unicons/icons/uil-signout';
import UilHome from '@iconscout/react-unicons/icons/uil-home';
import UilTimes from '@iconscout/react-unicons/icons/uil-times';
import UilExclamationTriangle from '@iconscout/react-unicons/icons/uil-exclamation-triangle';
import UilInfoCircle from '@iconscout/react-unicons/icons/uil-info-circle';
import UilPlus from '@iconscout/react-unicons/icons/uil-plus';
import UilEllipsisH from '@iconscout/react-unicons/icons/uil-ellipsis-h';
import UilFilter from '@iconscout/react-unicons/icons/uil-filter';
import UilSpinnerAlt from '@iconscout/react-unicons/icons/uil-spinner-alt';
import UilCheck from '@iconscout/react-unicons/icons/uil-check';
import UilEdit from '@iconscout/react-unicons/icons/uil-edit';
import UilCopy from '@iconscout/react-unicons/icons/uil-copy';
import UilTable from '@iconscout/react-unicons/icons/uil-table';
import UilDocumentInfo from '@iconscout/react-unicons/icons/uil-document-info';
import UilTrashAlt from '@iconscout/react-unicons/icons/uil-trash-alt';


const ICONS = {
  angleDown: UilAngleDown,
  angleUp: UilAngleUp,
  angleLeft: UilAngleLeft,
  angleRight: UilAngleRight,
  arrowLeft: UilArrowLeft,
  arrowUp: UilArrowUp,
  arrowDown: UilArrowDown,
  bars: UilBars,
  bell: UilBell,
  building: UilBuilding,
  calendarAlt: UilCalendarAlt,
  chart: UilChart,
  check: UilCheck,
  checkCircle: UilCheckCircle,
  clockThree: UilClockThree,
  cog: UilCog,
  copy: UilCopy,
  documentInfo: UilDocumentInfo,
  edit: UilEdit,
  export: UilExport,
  eye: UilEye,
  eyeSlash: UilEyeSlash,
  fileAlt: UilFileAlt,
  fileInfo: UilFileInfoAlt,
  folderOpen: UilFolderOpen,
  table: UilTable,
  trash: UilTrashAlt,
  graduationCap: UilGraduationCap,
  home: UilHome,
  import: UilImport,
  close: UilTimes,
  alert: UilExclamationTriangle,
  info: UilInfoCircle,
  plus: UilPlus,
  more: UilEllipsisH,
  filter: UilFilter,
  layers: UilLayers,
  lock: UilLock,
  processor: UilProcessor,
  robot: UilRobot,
  search: UilSearch,
  setting: UilSetting,
  signout: UilSignout,
  spinnerAlt: UilSpinnerAlt,
  sync: UilSync,
  user: UilUser,
  usersAlt: UilUsersAlt,
} as const;

export type IconScoutName = keyof typeof ICONS;

export type IconScoutSizeToken = number | 'sm' | 'md' | 'lg' | 'xl';
const SIZE_MAP: Record<string, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 40,
};

const DEFAULT_SIZE = 16;
const DEFAULT_COLOR = 'currentColor';

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
  color = DEFAULT_COLOR,
  className,
  'data-testid': dataTestId,
}) => {
  const Component = ICONS[name];
  const resolvedSize = typeof size === 'string' ? (SIZE_MAP[size] ?? DEFAULT_SIZE) : size;
  return (
    <Component
      size={resolvedSize}
      color={color}
      className={className}
      data-testid={dataTestId ?? `icon-${name}`}
    />
  );
};

export const iconScoutNames = Object.keys(ICONS) as IconScoutName[];
