import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../index.ts';
import {
  addNotification,
  clearNotifications,
  closeAllModals,
  closeLastModal,
  closeModal,
  openModal,
  removeNotification,
  openSidePanel,
  closeSidePanel,
} from '../../store/slices/uiSlice.ts';
import {
  selectActiveModal,
  selectHasModals,
  selectModals,
  selectNotificationCount,
  selectNotifications,
} from '../../store/selectors/uiSelectors.ts';
import type { NotificationType } from '../../store/slices/uiSlice.ts';

/**
 * Hook personalizado para la gestión del estado de UI
 * Encapsula toda la lógica de UI y proporciona una API limpia
 */
export const useUI = () => {
  const dispatch = useAppDispatch();
  // Layout selectors
  const sidePanel = useAppSelector((state) => state.ui.sidePanel);

  // Notification selectors
  const notifications = useAppSelector(selectNotifications);
  const notificationCount = useAppSelector(selectNotificationCount);

  // Modal selectors
  const modals = useAppSelector(selectModals);
  const activeModal = useAppSelector(selectActiveModal);
  const hasModals = useAppSelector(selectHasModals);
  // Layout actions
  const layoutActions = {
    openSidePanel: useCallback(
      (
        payload: {
                    title?: string;
                    component?: string;
                    props?: Record<string, unknown>;
                },
      ) => dispatch(openSidePanel(payload)),
      [dispatch],
    ),
    closeSidePanel: useCallback(() => dispatch(closeSidePanel()), [dispatch]),
  };
  // Notification actions
  const notificationActions = {
    showNotification: useCallback(
      (type: NotificationType, message: string, duration: number) => {
        dispatch(addNotification({ type, message, duration }));
      },
      [dispatch],
    ),
    showSuccess: useCallback(
      (message: string) => {
        dispatch(addNotification({ type: 'success', message }));
      },
      [dispatch],
    ),
    showError: useCallback(
      (message: string) => {
        dispatch(addNotification({ type: 'error', message }));
      },
      [dispatch],
    ),
    showWarning: useCallback(
      (message: string) => {
        dispatch(addNotification({ type: 'warning', message }));
      },
      [dispatch],
    ),
    showInfo: useCallback(
      (message: string) => {
        dispatch(addNotification({ type: 'info', message }));
      },
      [dispatch],
    ),
    showImportant: useCallback(
      (message: string) => {
        dispatch(addNotification({ type: 'important', message }));
      },
      [dispatch],
    ),
    removeNotification: useCallback((id: string) => dispatch(removeNotification(id)), [dispatch]),
    clearNotifications: useCallback(() => dispatch(clearNotifications()), [dispatch]),
  };

  // Modal actions
  const modalActions = {
    openModal: useCallback(
      (component: string, props?: Record<string, unknown>, isClosable = true) => {
        dispatch(openModal({ component, props, isClosable }));
      },
      [dispatch],
    ),
    closeModal: useCallback((id: string) => dispatch(closeModal(id)), [dispatch]),
    closeLastModal: useCallback(() => dispatch(closeLastModal()), [dispatch]),
    closeAllModals: useCallback(() => dispatch(closeAllModals()), [dispatch]),
  };

  return {
    // Layout state
    sidePanel,

    // Notification state
    notifications,
    notificationCount,

    // Modal state
    modals,
    activeModal,
    hasModals,

    // Actions
    ...layoutActions,
    ...notificationActions,
    ...modalActions,
  };
};
