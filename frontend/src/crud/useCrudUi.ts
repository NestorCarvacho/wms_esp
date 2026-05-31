import { useCallback } from 'react';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';

export function useCrudUi() {
  const { showNotification, openModal, openSidePanel, closeSidePanel } = useUI();

  const notifySuccess = useCallback(
    (message: string) => showNotification({ type: 'success', message }),
    [showNotification],
  );

  const notifyError = useCallback(
    (message: string) => showNotification({ type: 'error', message }),
    [showNotification],
  );

  const notifyApiError = useCallback(
    (err: unknown, fallback: string) => {
      notifyError(err instanceof ApiError ? err.message : fallback);
    },
    [notifyError],
  );

  const confirmDelete = useCallback(
    (options: {
      title: string;
      bodyText: string;
      onConfirm: () => void | Promise<void>;
      successMessage?: string;
    }) => {
      openModal(
        'ConfirmModal',
        {
          variant: 'error',
          icon: 'alert',
          title: options.title,
          bodyText: options.bodyText,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          onConfirm: async () => {
            try {
              await options.onConfirm();
              if (options.successMessage) {
                notifySuccess(options.successMessage);
              }
            } catch (err) {
              notifyApiError(err, 'Error al eliminar');
              throw err;
            }
          },
        },
        true,
      );
    },
    [openModal, notifySuccess, notifyApiError],
  );

  return {
    notifySuccess,
    notifyError,
    notifyApiError,
    confirmDelete,
    openSidePanel,
    closeSidePanel,
  };
}
