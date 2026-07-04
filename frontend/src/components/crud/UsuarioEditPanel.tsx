import { useEffect, useState, type FormEvent } from 'react';
import { actualizarUsuario } from '@/api/usuarios';
import { listarCargos } from '@/api/cargos';
import { listarRoles } from '@/api/roles';
import { listarRolesUsuario, sincronizarRolesUsuario } from '@/api/usuarioRoles';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Cargo, Rol, UsuarioLista } from '@/types/api';
import { preserveActivoBoolean } from './preserveActivo';

export interface UsuarioEditPanelProps {
  usuario: UsuarioLista;
  onSaved?: () => void;
}

export function UsuarioEditPanel({ usuario, onSaved }: UsuarioEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [email, setEmail] = useState(usuario.email);
  const [cargoId, setCargoId] = useState(usuario.cargo_id != null ? String(usuario.cargo_id) : '');
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [rolIds, setRolIds] = useState<number[]>([]);
  const [contrasena, setContrasena] = useState('');
  const [loadingCargos, setLoadingCargos] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCargos(true);
    const listParams = {
      pagina: 1,
      porPagina: 200,
      ...(usuario.empresa_id != null ? { empresaId: usuario.empresa_id } : {}),
    };
    Promise.all([listarCargos(listParams), listarRoles(listParams), listarRolesUsuario(usuario.id)])
      .then(([cargosRes, rolesRes, usuarioRoles]) => {
        if (cancelled) return;
        setCargos(cargosRes.cargos.filter((c) => c.empresa_id === usuario.empresa_id));
        setRoles(rolesRes.roles.filter((r) => r.empresa_id === usuario.empresa_id));
        setRolIds(usuarioRoles.rol_ids);
      })
      .catch(() => {
        if (!cancelled) {
          setCargos([]);
          setRoles([]);
          setRolIds([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCargos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [usuario.id, usuario.empresa_id]);

  const cargoOptions = [
    { label: 'Sin cargo', value: '' },
    ...cargos.map((c) => ({ label: c.nombre, value: String(c.id) })),
  ];

  function toggleRol(id: number) {
    setRolIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarUsuario(usuario.id, {
        email: email.trim(),
        cargo_id: cargoId ? Number(cargoId) : null,
        activo: preserveActivoBoolean(usuario.activo),
        ...(contrasena.trim() ? { contrasena: contrasena } : {}),
      });
      await sincronizarRolesUsuario(usuario.id, rolIds);
      showNotification({
        type: 'success',
        message: 'Usuario actualizado. El usuario debe volver a iniciar sesión para aplicar roles.',
      });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al actualizar usuario',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="edit-email" label="Email" type="email" value={email} onChange={setEmail} required />
      <LabelInput
        id="edit-contrasena"
        label="Nueva contraseña (opcional)"
        type="password"
        value={contrasena}
        onChange={setContrasena}
        placeholder="Dejar en blanco para no cambiar"
      />
      <ComboBox
        id="edit-cargo"
        label="Cargo (organizacional)"
        options={cargoOptions}
        value={cargoId}
        onChange={(v) => setCargoId(String(v))}
        searchable
        disabled={loadingCargos}
      />
      <p className="text-sm text-neutral-500 -mt-2">
        El cargo describe el puesto. Los permisos efectivos vienen de los roles asignados abajo.
      </p>
      <div>
        <p className="text-sm font-medium mb-2">Roles de seguridad</p>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border rounded p-3">
          {roles.length === 0 && <p className="text-sm text-neutral-500">No hay roles en esta empresa.</p>}
          {roles.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={rolIds.includes(r.id)}
                onChange={() => toggleRol(r.id)}
              />
              <span>{r.nombre}</span>
              {r.descripcion && <span className="text-neutral-500">— {r.descripcion}</span>}
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
