import { useState, type FormEvent } from 'react';
import { crearBodega } from '@/api/bodegas';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface BodegaCreatePanelProps {
  onSaved?: () => void;
}

export function BodegaCreatePanel({ onSaved }: BodegaCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearBodega({ nombre: nombre.trim(), codigo: codigo.trim(), activo: 1 });
      showNotification({ type: 'success', message: 'Bodega creada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear bodega',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="create-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="create-codigo" label="Código" value={codigo} onChange={setCodigo} required />
      <CrudPanelFooter submitting={submitting} submitLabel="Guardar bodega" />
    </form>
  );
}
