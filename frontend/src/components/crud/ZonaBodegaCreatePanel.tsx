import { useEffect, useState, type FormEvent } from 'react';
import { listarBodegas } from '@/api/bodegas';
import { listarTiposZona } from '@/api/tiposZona';
import { crearZonaBodega } from '@/api/zonasBodega';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Bodega, TipoZona } from '@/types/api';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface ZonaBodegaCreatePanelProps {
  empresaId?: number;
  onSaved?: () => void;
}

export function ZonaBodegaCreatePanel({ empresaId, onSaved }: ZonaBodegaCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [tiposZona, setTiposZona] = useState<TipoZona[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [bodegaId, setBodegaId] = useState('');
  const [tipoZonaId, setTipoZonaId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const listParams = {
      pagina: 1,
      porPagina: 500,
      ...(empresaId != null ? { empresaId } : {}),
    };
    Promise.all([listarBodegas(listParams), listarTiposZona(listParams)])
      .then(([bodegasRes, tiposRes]) => {
        if (cancelled) return;
        setBodegas(bodegasRes.bodegas);
        setTiposZona(tiposRes.tipos_zona);
        setBodegaId(bodegasRes.bodegas.length ? String(bodegasRes.bodegas[0].id) : '');
        setTipoZonaId(tiposRes.tipos_zona.length ? String(tiposRes.tipos_zona[0].id) : '');
      })
      .catch(() => {
        if (!cancelled) {
          setBodegas([]);
          setTiposZona([]);
          setBodegaId('');
          setTipoZonaId('');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [empresaId]);

  const bodegaOptions = bodegas.map((b) => ({
    label: `${b.nombre}${b.codigo ? ` (${b.codigo})` : ''}`,
    value: String(b.id),
  }));

  const tipoOptions = tiposZona.map((t) => ({
    label: t.nombre,
    value: String(t.id),
  }));

  const canSubmit = bodegaOptions.length > 0 && tipoOptions.length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bodegaId || !tipoZonaId) {
      showNotification({ type: 'error', message: 'Seleccione bodega y tipo de zona' });
      return;
    }
    setSubmitting(true);
    try {
      await crearZonaBodega({
        bodega_id: Number(bodegaId),
        tipo_zona_id: Number(tipoZonaId),
        nombre: nombre.trim() || null,
        activo: 1,
      });
      showNotification({ type: 'success', message: 'Zona de bodega creada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear zona de bodega',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando opciones…</p>;
  }

  if (!canSubmit) {
    return (
      <p className="text-sm text-neutral-500">
        Crea al menos una bodega y un tipo de zona antes de registrar zonas.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Selector
        id="create-bodega"
        label="Bodega"
        options={bodegaOptions}
        value={bodegaId}
        onChange={(v) => setBodegaId(String(v))}
      />
      <Selector
        id="create-tipo-zona"
        label="Tipo de zona"
        options={tipoOptions}
        value={tipoZonaId}
        onChange={(v) => setTipoZonaId(String(v))}
      />
      <LabelInput
        id="create-nombre"
        label="Nombre (opcional)"
        value={nombre}
        onChange={setNombre}
        placeholder="Ej. Pasillo A-1"
      />
      <CrudPanelFooter submitting={submitting} submitLabel="Guardar zona" />
    </form>
  );
}
