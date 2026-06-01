import { useState, type FormEvent } from 'react';
import { actualizarZonaBodega } from '@/api/zonasBodega';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Bodega, TipoZona, ZonaBodega } from '@/types/api';
import { preserveActivoNumber } from './preserveActivo';

export interface ZonaBodegaEditPanelProps {
  zona: ZonaBodega;
  bodegas: Bodega[];
  tiposZona: TipoZona[];
  onSaved?: () => void;
}

export function ZonaBodegaEditPanel({ zona, bodegas, tiposZona, onSaved }: ZonaBodegaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(zona.nombre ?? '');
  const [bodegaId, setBodegaId] = useState(String(zona.bodega_id));
  const [tipoZonaId, setTipoZonaId] = useState(String(zona.tipo_zona_id));
  const [submitting, setSubmitting] = useState(false);

  const bodegaOptions = bodegas.map((b) => ({
    label: `${b.nombre}${b.codigo ? ` (${b.codigo})` : ''}`,
    value: String(b.id),
  }));

  const tipoOptions = tiposZona.map((t) => ({
    label: t.nombre,
    value: String(t.id),
  }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarZonaBodega(zona.id, {
        bodega_id: Number(bodegaId),
        tipo_zona_id: Number(tipoZonaId),
        nombre: nombre.trim() || null,
        activo: preserveActivoNumber(zona.activo),
      });
      showNotification({ type: 'success', message: 'Zona actualizada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar zona',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Selector
        id="edit-bodega"
        label="Bodega"
        options={bodegaOptions}
        value={bodegaId}
        onChange={(v) => setBodegaId(String(v))}
      />
      <Selector
        id="edit-tipo"
        label="Tipo de zona"
        options={tipoOptions}
        value={tipoZonaId}
        onChange={(v) => setTipoZonaId(String(v))}
      />
      <LabelInput id="edit-nombre" label="Nombre (opcional)" value={nombre} onChange={setNombre} />
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
