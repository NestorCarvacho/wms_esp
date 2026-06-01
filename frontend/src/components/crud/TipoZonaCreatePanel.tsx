import { useState, type FormEvent } from 'react';
import { crearTipoZona } from '@/api/tiposZona';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface TipoZonaCreatePanelProps {
  onSaved?: () => void;
}

export function TipoZonaCreatePanel({ onSaved }: TipoZonaCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearTipoZona({ nombre: nombre.trim() });
      showNotification({ type: 'success', message: 'Tipo de zona creado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear tipo de zona',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="create-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <CrudPanelFooter submitting={submitting} submitLabel="Guardar tipo" />
    </form>
  );
}
