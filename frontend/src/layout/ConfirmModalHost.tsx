import { useUI } from '@/hooks/ui';
import { ConfirmModal, type ConfirmModalProps } from '@/components/ui/modals/ConfirmModal';
import type { Modal } from '@/store/slices/uiSlice';

export function ConfirmModalHost() {
  const { modals, closeModal } = useUI();
  const confirmModals = modals.filter((modal: Modal) => modal.component === 'ConfirmModal');

  if (confirmModals.length === 0) {
    return null;
  }

  return (
    <>
      {confirmModals.map((modal) => (
        <div
          key={modal.id}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget && (modal.isClosable ?? true)) {
              closeModal(modal.id);
            }
          }}
        >
          <ConfirmModal
            {...((modal.props ?? {}) as Omit<ConfirmModalProps, 'onClose'>)}
            onClose={() => closeModal(modal.id)}
          />
        </div>
      ))}
    </>
  );
}
