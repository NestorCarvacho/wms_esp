import { useState, type FormEvent } from 'react';
import { crearUnidadMedida } from '@/api/unidadesMedida';
import { EmpresaCreateSelector } from '@/components/crud/EmpresaCreateSelector';
import { LabelInput } from '@/components/ui/inputs';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { useEmpresaMaestraCreateForm } from '@/crud/useEmpresaMaestraCreateForm';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface UnidadMedidaCreatePanelProps {
  onSaved?: () => void;
}

export function UnidadMedidaCreatePanel({ onSaved }: UnidadMedidaCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const empresaCreate = useEmpresaMaestraCreateForm();
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearUnidadMedida({
        codigo: codigo.trim(),
        nombre: nombre.trim(),
        activo: 1,
        ...(empresaCreate.empresaIdNumber != null ? { empresa_id: empresaCreate.empresaIdNumber } : {}),
      });
      showNotification({ type: 'success', message: 'Unidad de medida creada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear unidad de medida',
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
      <LabelInput id="create-codigo" label="Código" value={codigo} onChange={setCodigo} required placeholder="KG" />
      <LabelInput id="create-nombre" label="Nombre" value={nombre} onChange={setNombre} required placeholder="Kilogramo" />
      <CrudPanelFooter submitting={submitting} disabled={!empresaCreate.isValid} submitLabel="Guardar unidad" />
    </form>
  );
}
