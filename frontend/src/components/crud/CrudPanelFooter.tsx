import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';

interface CrudPanelFooterProps {
  submitting?: boolean;
  disabled?: boolean;
  submitLabel?: string;
}

export function CrudPanelFooter({
  submitting = false,
  disabled = false,
  submitLabel = 'Guardar',
}: CrudPanelFooterProps) {
  const { closeSidePanel } = useUI();

  return (
    <div className="flex gap-3 pt-2">
      <PrimaryButton type="button" variant="outline" onClick={closeSidePanel}>
        Cancelar
      </PrimaryButton>
      <PrimaryButton type="submit" colorVariant="success" isLoading={submitting} disabled={disabled}>
        {submitLabel}
      </PrimaryButton>
    </div>
  );
}
