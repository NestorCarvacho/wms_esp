import { useState, type FormEvent } from 'react';
import { crearPermiso } from '@/api/permisos';
import { EmpresaCreateSelector } from '@/components/crud/EmpresaCreateSelector';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { useEmpresaMaestraCreateForm } from '@/crud/useEmpresaMaestraCreateForm';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface PermisoCreatePanelProps {
  onSaved?: () => void;
}

export function PermisoCreatePanel({ onSaved }: PermisoCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const empresaCreate = useEmpresaMaestraCreateForm();
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearPermiso({
        codigo: codigo.trim(),
        descripcion: descripcion.trim() || null,
        ...(empresaCreate.empresaIdNumber != null ? { empresa_id: empresaCreate.empresaIdNumber } : {}),
      });
      showNotification({ type: 'success', message: 'Permiso creado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear permiso',
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
      <LabelInput id="create-codigo" label="Código" value={codigo} onChange={setCodigo} required placeholder="inventario.ver" />
      <LabelInput id="create-descripcion" label="Descripción" value={descripcion} onChange={setDescripcion} />
      <CrudPanelFooter submitting={submitting} disabled={!empresaCreate.isValid} submitLabel="Guardar permiso" />
    </form>
  );
}
