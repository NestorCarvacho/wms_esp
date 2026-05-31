import { useState, type FormEvent } from 'react';
import { actualizarUnidadMedida } from '@/api/unidadesMedida';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { UnidadMedida } from '@/types/api';
import { ACTIVO_OPTIONS, activoValueToNumber } from './formOptions';

export interface UnidadMedidaEditPanelProps {
  unidad: UnidadMedida;
  onSaved?: () => void;
}

export function UnidadMedidaEditPanel({ unidad, onSaved }: UnidadMedidaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [codigo, setCodigo] = useState(unidad.codigo ?? '');
  const [nombre, setNombre] = useState(unidad.nombre);
  const [activo, setActivo] = useState(String(unidad.activo ?? 1));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarUnidadMedida(unidad.id, {
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        activo: activoValueToNumber(activo),
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
