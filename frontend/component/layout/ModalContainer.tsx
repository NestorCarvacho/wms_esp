import React from 'react';
import { useUI } from '@/hooks/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/shadcn/dialog';
import { cn } from '@/lib/utils';
import type { Modal as ModalData } from '@/store/slices/uiSlice';
import { ConfirmModal } from '@/components/ui/modals/ConfirmModal';

const sizeClasses: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-4xl',
};

const componentRegistry: Record<
  string,
  {
    component: React.ComponentType<any>;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    useSimpleLayout?: boolean;
  }
> = {
  ConfirmModal: {
    component: ConfirmModal,
    size: 'md',
    useSimpleLayout: true,
  },
};

export const ModalContainer: React.FC = () => {
  const { modals, closeModal } = useUI();

  if (!modals?.length) return null;

  return (
    <>
      {modals.map((modal: ModalData) => {
        const registered = componentRegistry[modal.component];
        const isClosable = modal.isClosable ?? true;
        const size = registered?.size ?? 'md';

        if (registered) {
          const { component: ModalComponent, title, useSimpleLayout } = registered;

          return (
            <Dialog
              key={modal.id}
              open
              onOpenChange={(open) => {
                if (!open && isClosable) closeModal(modal.id);
              }}
            >
              <DialogContent
                className={cn(
                  sizeClasses[size],
                  useSimpleLayout && 'border-0 bg-transparent p-0 shadow-none sm:max-w-[400px]',
                )}
                onInteractOutside={(e) => {
                  if (!isClosable) e.preventDefault();
                }}
              >
                {!useSimpleLayout && title && (
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                  </DialogHeader>
                )}
                <ModalComponent
                  {...(modal.props || {})}
                  onClose={() => closeModal(modal.id)}
                />
              </DialogContent>
            </Dialog>
          );
        }

        return (
          <Dialog
            key={modal.id}
            open
            onOpenChange={(open) => {
              if (!open && isClosable) closeModal(modal.id);
            }}
          >
            <DialogContent className={sizeClasses.md}>
              <DialogHeader>
                <DialogTitle>Modal: {modal.component}</DialogTitle>
              </DialogHeader>
              <pre className="text-xs overflow-auto">{JSON.stringify(modal.props, null, 2)}</pre>
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
};

export default ModalContainer;
