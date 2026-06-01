import { useState, type FormEvent } from 'react';
import { actualizarTipoProducto } from '@/api/tiposProducto';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { TipoProducto } from '@/types/api';
import { preserveActivoNumber } from './preserveActivo';

export interface TipoProductoEditPanelProps {
  tipoProducto: TipoProducto;
  onSaved?: () => void;
}

export function TipoProductoEditPanel({ tipoProducto, onSaved }: TipoProductoEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(tipoProducto.nombre);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarTipoProducto(tipoProducto.id, {
        nombre: nombre.trim(),
        activo: preserveActivoNumber(tipoProducto.activo),
      });
      showNotification({ type: 'success', message: 'Tipo de producto actualizado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar tipo de producto',
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
