import { useState, type FormEvent } from 'react';
import { actualizarEmpresa } from '@/api/empresas';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Empresa } from '@/types/api';

const ESTADO_EMPRESA_OPTIONS = [
  { label: 'Activa', value: '1' },
  { label: 'Inactiva', value: '0' },
];

export interface EmpresaEditPanelProps {
  empresa: Empresa;
  onSaved?: () => void;
}

export function EmpresaEditPanel({ empresa, onSaved }: EmpresaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(empresa.nombre);
  const [rut, setRut] = useState(empresa.rut ?? '');
  const [activa, setActiva] = useState(empresa.esta_activa ? '1' : '0');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarEmpresa(empresa.id, {
        nombre: nombre.trim(),
        rut: rut.trim() || null,
        esta_activa: activa === '1',
      });
      showNotification({ type: 'success', message: 'Empresa actualizada correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar empresa',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-codigo" label="Código" value={empresa.codigo} onChange={() => undefined} disabled />
      <LabelInput id="edit-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="edit-rut" label="RUT (opcional)" value={rut} onChange={setRut} />
      <Selector
        id="edit-activa"
        label="Estado"
        options={ESTADO_EMPRESA_OPTIONS}
        value={activa}
        onChange={(v) => setActiva(String(v))}
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
