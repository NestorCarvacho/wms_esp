import React from 'react';
import { useTranslation } from '@/i18n';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { Text } from '@/components/ui/text/Text';
import { Card } from '@/components/ui/cards/Card';
import { IconScout, IconScoutName } from '@/components/ui/images/IconScout';
import { colorClass } from '@/assets/styles/colors';
import { cn } from '@/lib/utils';


export type ConfirmModalVariant = 'default' | 'success' | 'alert' | 'error';

export interface ConfirmModalProps {
  variant?: ConfirmModalVariant;
  icon?: IconScoutName;
  title: string;
  bannerIcon?: IconScoutName;
  bannerText?: string;
  bodyText: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const variantConfig: Record<
  ConfirmModalVariant,
  { iconClass: string; buttonVariant: 'primary' | 'success' | 'alert' | 'error' }
> = {
  default: { iconClass: 'text-blue-400', buttonVariant: 'primary' },
  success: { iconClass: colorClass.successIcon, buttonVariant: 'success' },
  alert: { iconClass: colorClass.alert, buttonVariant: 'alert' },
  error: { iconClass: colorClass.destructive, buttonVariant: 'error' },
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  variant = 'default',
  icon,
  title,
  bannerIcon = 'info',
  bannerText,
  bodyText,
  onConfirm,
  onCancel,
  onClose,
  confirmText,
  cancelText,
  isLoading = false,
}) => {
  const { t: translate } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm();
    if (onClose) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  const { iconClass, buttonVariant } = variantConfig[variant];

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Card
        elevation={2}
        padding="24px"
        borderRadius="16px"
        data-testid="confirm-modal"
        className="flex flex-col gap-y-4 max-w-[370px]"
      >
        {icon && (
          <div className="flex justify-center" data-testid="confirm-modal-icon-container">
            <IconScout
              name={icon}
              size={32}
              color="currentColor"
              className={iconClass}
              data-testid="confirm-modal-icon"
            />
          </div>
        )}

        <Text
          variant="header-6"
          className={cn('text-center', colorClass.brand)}
          data-testid="confirm-modal-title"
        >
          {title}
        </Text>

        {bannerIcon && bannerText && (
          <div
            className={cn('flex items-center gap-2 py-2 px-4', colorClass.brandBgStrong)}
            data-testid="confirm-modal-banner"
          >
            <IconScout
              name={bannerIcon}
              size={24}
              color="currentColor"
              className={colorClass.accent}
              data-testid="confirm-modal-banner-icon"
            />
            <Text
              variant="small-regular"
              className={colorClass.body}
              data-testid="confirm-modal-banner-text"
            >
              {bannerText}
            </Text>
          </div>
        )}

        <Text
          variant="subheader-regular"
          className={colorClass.body}
          data-testid="confirm-modal-body"
        >
          {bodyText}
        </Text>

        <div className="flex justify-center gap-4">
          <PrimaryButton
            onClick={handleCancel}
            disabled={isLoading}
            variant="outline"
            data-testid="confirm-modal-cancel-button"
          >
            {cancelText || translate('common:actions.cancel')}
          </PrimaryButton>

          <PrimaryButton
            onClick={handleConfirm}
            disabled={isLoading}
            colorVariant={buttonVariant}
            data-testid="confirm-modal-confirm-button"
          >
            {confirmText || translate('common:actions.delete')}
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmModal;
