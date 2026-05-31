export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'important';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, unknown>;
  isClosable?: boolean;
}

export interface SidePanelState {
  open: boolean;
  component?: string;
  title?: string;
  props?: Record<string, unknown>;
}
