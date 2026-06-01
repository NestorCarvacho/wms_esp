import { useState, type FormEvent } from 'react';
import { actualizarUnidadMedida } from '@/api/unidadesMedida';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { UnidadMedida } from '@/types/api';
import { preserveActivoNumber } from './preserveActivo';

export interface UnidadMedidaEditPanelProps {
  unidad: UnidadMedida;
  onSaved?: () => void;
}

export function UnidadMedidaEditPanel({ unidad, onSaved }: UnidadMedidaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [codigo, setCodigo] = useState(unidad.codigo ?? '');
  const [nombre, setNombre] = useState(unidad.nombre);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarUnidadMedida(unidad.id, {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        activo: preserveActivoNumber(unidad.activo),
      });
      showNotification({ type: 'success', message: 'Unidad de medida actualizada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar unidad de medida',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-codigo" label="Código" value={codigo} onChange={setCodigo} required />
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
