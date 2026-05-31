import React, { useEffect } from 'react';
import { Card } from '@/components/ui/cards/Card';
import { colors } from '@/assets/styles/colors';
import { IconScout, IconScoutName } from '@/components/ui/images/IconScout';
import { Text } from '@/components/ui/text/Text';
import type { NotificationType } from '@/store/slices/uiSlice';


export interface NotificationProps {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

interface VariantVisualConfig {
  background: string;
  iconContainer: string;
  iconColor: string;
  textColor: string;
  closeColor: string;
  icon: IconScoutName;
}

const notificationColors = colors.notification;

const VARIANT_CONFIG: Record<NotificationType, VariantVisualConfig> = {
  info: {
    background: notificationColors.primaryBackground,
    iconContainer: notificationColors.primaryIconContainer,
    iconColor: colors.primary.auxiliar,
    textColor: colors.primary.main,
    closeColor: colors.primary.main,
    icon: 'info',
  },
  success: {
    background: notificationColors.successBackground,
    iconContainer: notificationColors.successIconContainer,
    iconColor: colors.feedback.success400,
    textColor: colors.feedback.success400,
    closeColor: colors.feedback.success400,
    icon: 'checkCircle',
  },
  warning: {
    background: notificationColors.alertBackground,
    iconContainer: notificationColors.alertIconContainer,
    iconColor: colors.feedback.alert400,
    textColor: colors.grays.neutral33,
    closeColor: colors.feedback.alert400,
    icon: 'alert',
  },
  error: {
    background: notificationColors.errorBackground,
    iconContainer: notificationColors.errorIconContainer,
    iconColor: colors.feedback.error100,
    textColor: colors.grays.neutral33,
    closeColor: colors.feedback.error300,
    icon: 'info',
  },
  important: {
    background: notificationColors.importantBackground,
    iconContainer: notificationColors.importantIconContainer,
    iconColor: colors.grays.neutralFF,
    textColor: colors.primary.main,
    closeColor: colors.primary.main,
    icon: 'info',
  },
};


export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  duration,
  onDismiss,
}) => {
  const variantConfig = VARIANT_CONFIG[type];

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  return (
    <Card
      elevation={2}
      backgroundColor={variantConfig.background}
      padding="0"
      borderRadius="16px"
      className="relative overflow-hidden flex w-full min-w-[250px]"
    >
      {/* Icon container */}
      <div
        className="flex items-center justify-center shrink-0 w-[72px] basis-[72px]"
        style={{ backgroundColor: variantConfig.iconContainer }}
      >
        <IconScout name={variantConfig.icon} size="lg" color={variantConfig.iconColor} />
      </div>

      {/* Content area */}
      <div className="flex-1 flex items-center gap-3 px-4 py-3" style={{ color: variantConfig.textColor }}>
        <div className="flex-1 min-w-0">
          <Text variant="subheader-medium" color={variantConfig.textColor}>
            {message}
          </Text>
        </div>
        <button
          onClick={() => onDismiss(id)}
          aria-label="Close notification"
          className="p-1 rounded hover:opacity-80 transition-opacity"
          style={{ color: variantConfig.closeColor }}
        >
          <IconScout name="close" size="md" color={variantConfig.closeColor} />
        </button>
      </div>
    </Card>
  );
};

export default Notification;
