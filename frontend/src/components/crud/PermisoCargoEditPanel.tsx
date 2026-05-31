import { useState, type FormEvent } from 'react';
import { actualizarPermisoCargo } from '@/api/permisosCargo';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { PermisoCargo } from '@/types/api';
import { ACTIVO_OPTIONS, activoValueToNumber, boolToActivoValue } from './formOptions';

export interface PermisoCargoEditPanelProps {
  permiso: PermisoCargo;
  onSaved?: () => void;
}

export function PermisoCargoEditPanel({ permiso, onSaved }: PermisoCargoEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [activo, setActivo] = useState(boolToActivoValue(permiso.activo));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarPermisoCargo(permiso.cargo_id, permiso.rol_id, {
        activo: activoValueToNumber(activo),
      });
      showNotification({ type: 'success', message: 'Permiso cargo actualizado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar permiso cargo',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput
        id="edit-cargo"
        label="Cargo"
        value={permiso.cargo_nombre ?? String(permiso.cargo_id)}
        onChange={() => undefined}
        disabled
      />
      <LabelInput
        id="edit-rol"
        label="Rol"
        value={permiso.rol_nombre ?? String(permiso.rol_id)}
        onChange={() => undefined}
        disabled
      />
      <Selector
        id="edit-activo"
        label="Estado"
        options={ACTIVO_OPTIONS}
        value={activo}
        onChange={(v) => setActivo(String(v))}
      />
      <div className="flex gap-3 pt-2">
        <PrimaryButton type="button" variant="outline" onClick={closeSidePanel}>
          Cancelar
        </PrimaryButton>
        <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
          Guardar
        </PrimaryButton>
      </div>
    </form>
  );
}
