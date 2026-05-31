import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Text } from '@/components/ui/text/Text';
import { colors } from '@/assets/styles/colors';
import { IconScout, IconScoutName } from '@/components/ui/images/IconScout';
import { useBreadcrumb } from '@/hooks/ui/navigation/useBreadcrumb';


interface BreadcrumbItem {
  text: string;
  href?: string;
  onClick?: () => void;
}

type TitleVariant =
  | 'header-4'
  | 'header-5'
  | 'header-6'
  | 'body-medium';

interface BreadcrumbProps {
  // Manual mode: explicit props
  icon?: IconScoutName;
  items?: BreadcrumbItem[];
  title?: string;
  titleVariant?: TitleVariant;
  supportingText?: string;
  className?: string;
  backTo?: string;
  
  // Automatic mode: dynamic title override (e.g., user name)
  dynamicTitle?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  icon: manualIcon,
  items: manualItems,
  title: manualTitle,
  titleVariant = 'header-5',
  supportingText,
  className = '',
  backTo: manualBackTo,
  dynamicTitle,
}) => {
  const navigate = useNavigate();
  const autoData = useBreadcrumb();

  // Priority: manual props > automatic data
  const icon = manualIcon ?? autoData?.icon;
  const items = manualItems ?? autoData?.items ?? [];
  const baseTitle = manualTitle ?? autoData?.title ?? '';
  const title = dynamicTitle ?? baseTitle;
  const backTo = manualBackTo ?? autoData?.backTo;

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <div className="mr-1 md:mr-1.5 flex items-center">
        <IconScout
          name={icon}
          size={10}
          color={colors.primary.dash}
          data-testid="breadcrumb-icon"
          className="md:!w-3 md:!h-3"
        />
      </div>
    );
  };

  const renderBreadcrumbItems = () => {
    const breadcrumbText = items
      .map((item) => item.text)
      .join(' / ');

    return (
      <Text
        variant="small-regular"
        color={colors.primary.dash}
        className="text-[9px] md:text-[10px]"
      >
        {breadcrumbText}
      </Text>
    );
  };

  const renderTitle = () => (
    <Text
      variant={titleVariant}
      color={colors.primary.main}
      className="m-0"
    >
      {title}
    </Text>
  );

  return (
    <div className={`breadcrumbs grid grid-cols-[24px_1fr] md:grid-cols-[32px_1fr] ${className}`}>
      {/* Row 1 placeholder to shift breadcrumb items line regardless of arrow presence */}
      <div className="col-start-1 row-start-1 w-6 md:w-8 h-0" aria-hidden="true" />
      {/* Breadcrumb items line */}
      <div className="col-start-2 row-start-1 flex items-center mb-1 md:mb-1.5">
        {renderIcon()}
        <div className="flex items-center flex-wrap">{renderBreadcrumbItems()}</div>
      </div>
      {/* Row 2: arrow (if any) aligned with title line */}
      <div className="col-start-1 row-start-2 w-6 md:w-8 h-5 md:h-6 flex items-center justify-center">
        {backTo ? (
          <button
            type="button"
            onClick={() => backTo && navigate(backTo)}
            className="flex items-center justify-center w-8 h-6"
            data-testid="breadcrumb-back-button"
            aria-label="Volver"
          >
            <IconScout 
              name="arrowLeft" 
              size={24} 
              color={colors.important.main}
            />
          </button>
        ) : (
          <div className="w-6 h-5 md:w-8 md:h-6" aria-hidden="true" data-testid="breadcrumb-back-placeholder" />
        )}
      </div>
      {/* Title line */}
      <div className="col-start-2 row-start-2">
        {renderTitle()}
        {supportingText && (
          <Text
            variant="subheader-regular"
            color={colors.grays.neutral33}
            className="mt-1 md:mt-1.5"
          >
            {supportingText}
          </Text>
        )}
      </div>
    </div>
  );
};

export default Breadcrumb;
