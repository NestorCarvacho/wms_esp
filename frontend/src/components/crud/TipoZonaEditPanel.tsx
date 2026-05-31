import { useState, type FormEvent } from 'react';
import { actualizarTipoZona } from '@/api/tiposZona';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { TipoZona } from '@/types/api';
import { ACTIVO_OPTIONS, activoValueToNumber } from './formOptions';

export interface TipoZonaEditPanelProps {
  tipoZona: TipoZona;
  onSaved?: () => void;
}

export function TipoZonaEditPanel({ tipoZona, onSaved }: TipoZonaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(tipoZona.nombre);
  const [activo, setActivo] = useState(String(tipoZona.activo ?? 1));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarTipoZona(tipoZona.id, {
        nombre: nombre.trim(),
        activo: activoValueToNumber(activo),
      });
      showNotification({ type: 'success', message: 'Tipo de zona actualizado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar tipo de zona',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
