import React, { useCallback, useEffect } from 'react';
import { useUI } from '@/hooks/ui';
import { IconScout } from '@/components/ui/images/IconScout';
import { colors } from '@/assets/styles/colors';
import type { Modal as ModalData } from '@/store/slices/uiSlice';
import { ImageCropModal } from '@/components/ui/inputs/ImageCropModal';
import { ConfirmModal } from '@/components/ui/modals/ConfirmModal';
import { ExportModal } from '@/components/ui/modals/ExportModal';


interface ModalBackdropProps {
  modalId: string;
  isClosable: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

const ModalBackdrop: React.FC<ModalBackdropProps> = ({
  modalId,
  isClosable,
  children,
  onClose,
}) => (
  <div
    key={modalId}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
    onClick={(e) => {
      if (e.target === e.currentTarget && isClosable) {
        onClose();
      }
    }}
  >
    {children}
  </div>
);

interface ModalProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  id,
  title,
  children,
  isClosable = true,
  onClose,
  size = 'md',
}) => {
  const { closeModal } = useUI();

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
    closeModal(id);
  }, [onClose, closeModal, id]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isClosable) {
      handleClose();
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isClosable) {
      handleClose();
    }
  }, [isClosable, handleClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return 'max-w-md';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${getSizeClasses()} w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        {(title || isClosable) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            {isClosable && (
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <IconScout name="close" size="md" color={colors.grays.neutral66} />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

// Modal container component to render all active modals
export const ModalContainer: React.FC = () => {
  const { modals, closeModal } = useUI();

  if (!modals || modals.length === 0) {
    return null;
  }

  // Component registry with metadata
  const componentRegistry: Record<string, { component: React.ComponentType<any>; title?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; useSimpleLayout?: boolean }> = {
    ImageCropModal: { 
      component: ImageCropModal, 
      title: 'Ajustar Imagen',
      size: 'xl',
    },
    ConfirmModal: {
      component: ConfirmModal,
      size: 'md',
      useSimpleLayout: true,
    },
    ExportModal: {
      component: ExportModal,
      size: 'md',
      useSimpleLayout: true,
    },
  };

  return (
    <>
      {modals.map((modal: ModalData) => {
        const registeredModal = componentRegistry[modal.component];

        if (registeredModal) {
          const { component: ModalComponent, title, size, useSimpleLayout } = registeredModal;
          
          // Modals with useSimpleLayout render their own Card/layout
          if (useSimpleLayout) {
            return (
              <ModalBackdrop
                key={modal.id}
                modalId={modal.id}
                isClosable={modal.isClosable ?? true}
                onClose={() => closeModal(modal.id)}
              >
                <ModalComponent
                  {...(modal.props || {})}
                  onClose={() => closeModal(modal.id)}
                />
              </ModalBackdrop>
            );
          }
          
          // Other modals use the standard Modal wrapper
          return (
            <Modal
              key={modal.id}
              id={modal.id}
              title={title}
              isClosable={modal.isClosable}
              size={size || 'md'}
            >
              <ModalComponent
                {...(modal.props || {})}
                onClose={() => closeModal(modal.id)}
              />
            </Modal>
          );
        }

        // Fallback for unregistered components
        return (
          <Modal
            key={modal.id}
            id={modal.id}
            isClosable={modal.isClosable}
            {...(modal.props || {})}
          >
            <div>
              <h3>Modal: {modal.component}</h3>
              <p>Modal ID: {modal.id}</p>
              <pre>{JSON.stringify(modal.props, null, 2)}</pre>
            </div>
          </Modal>
        );
      })}
    </>
  );
};

export default Modal;
