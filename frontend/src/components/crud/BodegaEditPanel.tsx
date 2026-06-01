import { useState, type FormEvent } from 'react';
import { actualizarBodega } from '@/api/bodegas';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Bodega } from '@/types/api';
import { preserveActivoNumber } from './preserveActivo';

export interface BodegaEditPanelProps {
  bodega: Bodega;
  onSaved?: () => void;
}

export function BodegaEditPanel({ bodega, onSaved }: BodegaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(bodega.nombre);
  const [codigo, setCodigo] = useState(bodega.codigo);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarBodega(bodega.id, {
        nombre: nombre.trim(),
        codigo: codigo.trim(),
        activo: preserveActivoNumber(bodega.activo),
      });
      showNotification({ type: 'success', message: 'Bodega actualizada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar bodega',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="edit-codigo" label="Código" value={codigo} onChange={setCodigo} required />
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
