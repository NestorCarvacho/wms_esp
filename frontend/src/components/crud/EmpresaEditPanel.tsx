import { useState, type FormEvent } from 'react';
import { actualizarEmpresa } from '@/api/empresas';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Empresa } from '@/types/api';

export interface EmpresaEditPanelProps {
  empresa: Empresa;
  onSaved?: () => void;
}

export function EmpresaEditPanel({ empresa, onSaved }: EmpresaEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(empresa.nombre);
  const [rut, setRut] = useState(empresa.rut ?? '');
  const [estaActiva, setEstaActiva] = useState(Boolean(empresa.esta_activa));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarEmpresa(empresa.id, {
        nombre: nombre.trim(),
        rut: rut.trim() || null,
        esta_activa: estaActiva,
      });
      showNotification({
        type: 'success',
        message: estaActiva ? 'Empresa actualizada correctamente' : 'Empresa inhabilitada',
      });
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
      {empresa.es_empresa_maestra ? (
        <p className="text-sm text-muted-foreground">La empresa maestra permanece siempre activa.</p>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={estaActiva}
            onChange={(e) => setEstaActiva(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Empresa activa (operativa en listados y login de sus usuarios)
        </label>
      )}
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
