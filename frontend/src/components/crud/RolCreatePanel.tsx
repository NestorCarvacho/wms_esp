import { useState, type FormEvent } from 'react';
import { crearRol } from '@/api/roles';
import { EmpresaCreateSelector } from '@/components/crud/EmpresaCreateSelector';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { useEmpresaMaestraCreateForm } from '@/crud/useEmpresaMaestraCreateForm';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface RolCreatePanelProps {
  onSaved?: () => void;
}

export function RolCreatePanel({ onSaved }: RolCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const empresaCreate = useEmpresaMaestraCreateForm();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearRol({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo: 1,
        ...(empresaCreate.empresaIdNumber != null ? { empresa_id: empresaCreate.empresaIdNumber } : {}),
      });
      showNotification({ type: 'success', message: 'Rol creado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear rol',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <EmpresaCreateSelector
        show={empresaCreate.showEmpresaField}
        value={empresaCreate.empresaId}
        onChange={empresaCreate.setEmpresaId}
        options={empresaCreate.empresaOptions}
        loading={empresaCreate.loading}
      />
      <LabelInput id="create-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="create-descripcion" label="Descripción" value={descripcion} onChange={setDescripcion} required />
      <CrudPanelFooter submitting={submitting} disabled={!empresaCreate.isValid} submitLabel="Guardar rol" />
    </form>
  );
}
