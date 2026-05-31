import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Modal, Notification, NotificationType, SidePanelState } from '@/store/slices/uiSlice';

interface ShowNotificationInput {
  type: NotificationType;
  message: string;
  duration?: number;
}

interface OpenSidePanelInput {
  component: string;
  title?: string;
  props?: Record<string, unknown>;
}

interface UIContextValue {
  modals: Modal[];
  sidePanel: SidePanelState | null;
  notifications: Notification[];
  openModal: (component: string, props?: Record<string, unknown>, isClosable?: boolean) => string;
  closeModal: (id?: string) => void;
  openSidePanel: (input: OpenSidePanelInput) => void;
  closeSidePanel: () => void;
  showNotification: (input: ShowNotificationInput) => void;
  removeNotification: (id: string) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<Modal[]>([]);
  const [sidePanel, setSidePanel] = useState<SidePanelState | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const openModal = useCallback(
    (component: string, props?: Record<string, unknown>, isClosable = true) => {
      const id = `modal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setModals((prev) => [...prev, { id, component, props, isClosable }]);
      return id;
    },
    [],
  );

  const closeModal = useCallback((id?: string) => {
    if (id) {
      setModals((prev) => prev.filter((m) => m.id !== id));
      return;
    }
    setModals((prev) => prev.slice(0, -1));
  }, []);

  const openSidePanel = useCallback((input: OpenSidePanelInput) => {
    setSidePanel({
      open: true,
      component: input.component,
      title: input.title,
      props: input.props,
    });
  }, []);

  const closeSidePanel = useCallback(() => {
    setSidePanel(null);
  }, []);

  const showNotification = useCallback((input: ShowNotificationInput) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setNotifications((prev) => [
      ...prev,
      {
        id,
        type: input.type,
        message: input.message,
        duration: input.duration ?? 3000,
      },
    ]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      modals,
      sidePanel,
      notifications,
      openModal,
      closeModal,
      openSidePanel,
      closeSidePanel,
      showNotification,
      removeNotification,
    }),
    [
      modals,
      sidePanel,
      notifications,
      openModal,
      closeModal,
      openSidePanel,
      closeSidePanel,
      showNotification,
      removeNotification,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI debe usarse dentro de UIProvider');
  }
  return ctx;
}
