import { useState, type FormEvent } from 'react';
import { crearCargo } from '@/api/cargos';
import { EmpresaCreateSelector } from '@/components/crud/EmpresaCreateSelector';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { useEmpresaMaestraCreateForm } from '@/crud/useEmpresaMaestraCreateForm';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface CargoCreatePanelProps {
  onSaved?: () => void;
}

export function CargoCreatePanel({ onSaved }: CargoCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const empresaCreate = useEmpresaMaestraCreateForm();
  const [nombre, setNombre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearCargo({
        nombre: nombre.trim(),
        ...(empresaCreate.empresaIdNumber != null ? { empresa_id: empresaCreate.empresaIdNumber } : {}),
      });
      showNotification({ type: 'success', message: 'Cargo creado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear cargo',
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
      <CrudPanelFooter submitting={submitting} disabled={!empresaCreate.isValid} submitLabel="Guardar cargo" />
    </form>
  );
}
