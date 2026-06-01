import { useState, type FormEvent } from 'react';
import { crearEmpresa } from '@/api/empresas';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface EmpresaCreatePanelProps {
  onSaved?: () => void;
}

export function EmpresaCreatePanel({ onSaved }: EmpresaCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearEmpresa({ codigo: codigo.trim(), nombre: nombre.trim(), rut: rut.trim() || null });
      showNotification({ type: 'success', message: 'Empresa creada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear empresa',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="create-codigo" label="Código" value={codigo} onChange={setCodigo} required />
      <LabelInput id="create-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="create-rut" label="RUT (opcional)" value={rut} onChange={setRut} />
      <CrudPanelFooter submitting={submitting} submitLabel="Guardar empresa" />
    </form>
  );
}
