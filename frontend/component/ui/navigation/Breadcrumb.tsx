import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { IconScout, type IconScoutName } from '@/components/ui/images/IconScout';
import { Button } from '@/components/ui/shadcn/button';
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/shadcn/breadcrumb';
import { useBreadcrumb } from '@/hooks/ui/navigation/useBreadcrumb';
import { sectionIconName } from '@/components/ui/menu';
import { cn } from '@/lib/utils';

interface BreadcrumbItemData {
  text: string;
  href?: string;
  onClick?: () => void;
}

type TitleVariant =
  | 'header-4'
  | 'header-5'
  | 'header-6'
  | 'body-medium';

const titleVariantClass: Record<TitleVariant, string> = {
  'header-4': 'text-3xl font-semibold tracking-tight text-slate-900',
  'header-5': 'text-2xl font-semibold tracking-tight text-slate-900',
  'header-6': 'text-xl font-semibold tracking-tight text-slate-900',
  'body-medium': 'text-base font-medium text-slate-900',
};

interface BreadcrumbProps {
  icon?: IconScoutName;
  items?: BreadcrumbItemData[];
  title?: string;
  titleVariant?: TitleVariant;
  supportingText?: string;
  className?: string;
  backTo?: string;
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

  const icon = manualIcon ?? autoData?.icon;
  const items: BreadcrumbItemData[] = manualItems ?? autoData?.items ?? [];
  const baseTitle = manualTitle ?? autoData?.title ?? '';
  const title = dynamicTitle ?? baseTitle;
  const backTo = manualBackTo ?? autoData?.backTo;
  const iconName = icon ? sectionIconName(icon) : null;

  const renderTrail = () => {
    if (items.length === 0) return null;

    return (
      <ShadcnBreadcrumb className="min-w-0">
        <BreadcrumbList className="text-xs text-muted-foreground sm:text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const content = item.href ? (
              <BreadcrumbLink asChild>
                <Link to={item.href}>{item.text}</Link>
              </BreadcrumbLink>
            ) : item.onClick ? (
              <BreadcrumbLink asChild>
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-foreground"
                >
                  {item.text}
                </button>
              </BreadcrumbLink>
            ) : isLast ? (
              <BreadcrumbPage>{item.text}</BreadcrumbPage>
            ) : (
              <span>{item.text}</span>
            );

            return (
              <React.Fragment key={`${item.text}-${index}`}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>{content}</BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </ShadcnBreadcrumb>
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(iconName || items.length > 0) && (
        <div className="flex min-w-0 items-center gap-2">
          {iconName && (
            <IconScout
              name={iconName}
              size={16}
              color="currentColor"
              className="shrink-0 text-muted-foreground"
              data-testid="breadcrumb-icon"
            />
          )}
          <div className="min-w-0 flex-1">{renderTrail()}</div>
        </div>
      )}

      <div className="flex items-start gap-2">
        {backTo ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-0.5 shrink-0 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
            onClick={() => navigate(backTo)}
            data-testid="breadcrumb-back-button"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div
            className="size-10 shrink-0"
            aria-hidden="true"
            data-testid="breadcrumb-back-placeholder"
          />
        )}
        <div className="min-w-0 flex-1">
          <h1 className={cn('m-0', titleVariantClass[titleVariant])}>{title}</h1>
          {supportingText && (
            <p className="mt-1 text-sm text-muted-foreground md:mt-1.5">{supportingText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
