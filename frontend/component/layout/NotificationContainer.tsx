import React from 'react';
import { useUI } from '@/hooks/ui';
import { Notification as NotificationCard } from '@/components/ui/notifications/Notification';
import type { Notification as StoreNotification } from '@/store/slices/uiSlice';


const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUI();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed left-1/2 top-auto bottom-4 -translate-x-1/2 transform z-50 space-y-3 w-[calc(100%-2rem)] max-w-md notification-container-position">
      {notifications.map((notification: StoreNotification) => (
        <NotificationCard
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
