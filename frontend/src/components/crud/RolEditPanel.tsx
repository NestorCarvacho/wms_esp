import { useEffect, useState, type FormEvent } from 'react';
import { actualizarRol } from '@/api/roles';
import { sincronizarPermisosRol, listarPermisosRol } from '@/api/permisos';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Permiso, Rol } from '@/types/api';
import { preserveActivoBoolean } from './preserveActivo';

export interface RolEditPanelProps {
  rol: Rol;
  permisos: Permiso[];
  onSaved?: () => void;
}

export function RolEditPanel({ rol, permisos, onSaved }: RolEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [nombre, setNombre] = useState(rol.nombre);
  const [descripcion, setDescripcion] = useState(rol.descripcion ?? '');
  const [permisoIds, setPermisoIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listarPermisosRol(rol.id)
      .then((res) => setPermisoIds(res.permiso_ids))
      .catch(() => setPermisoIds([]));
  }, [rol.id]);

  function togglePermiso(id: number) {
    setPermisoIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarRol(rol.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo: preserveActivoBoolean(rol.activo),
      });
      await sincronizarPermisosRol(rol.id, permisoIds);
      showNotification({ type: 'success', message: 'Rol actualizado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar rol',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-nombre" label="Nombre" value={nombre} onChange={setNombre} required />
      <LabelInput id="edit-descripcion" label="Descripción" value={descripcion} onChange={setDescripcion} required />
      <div>
        <p className="text-sm font-medium mb-2">Permisos del rol</p>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border rounded p-3">
          {permisos.length === 0 && <p className="text-sm text-gray-500">No hay permisos registrados.</p>}
          {permisos.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={permisoIds.includes(p.id)}
                onChange={() => togglePermiso(p.id)}
              />
              <span>{p.codigo}</span>
              {p.descripcion && <span className="text-gray-500">— {p.descripcion}</span>}
            </label>
          ))}
        </div>
      </div>
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
