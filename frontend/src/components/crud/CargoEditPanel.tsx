import { useState, type FormEvent } from 'react';
import { actualizarCargo } from '@/api/cargos';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Cargo } from '@/types/api';

export interface CargoEditPanelProps {
  cargo: Cargo;
  onSaved?: () => void;
}

export function CargoEditPanel({ cargo, onSaved }: CargoEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(cargo.nombre);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarCargo(cargo.id, { nombre: nombre.trim() });
      showNotification({ type: 'success', message: 'Cargo actualizado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar cargo',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
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
