import { useEffect, useState, type FormEvent } from 'react';
import { actualizarUsuario } from '@/api/usuarios';
import { listarCargos } from '@/api/cargos';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import type { Cargo, UsuarioLista } from '@/types/api';

const ESTADO_USUARIO_OPTIONS = [
  { label: 'Activo', value: '1' },
  { label: 'Inactivo', value: '0' },
];

export interface UsuarioEditPanelProps {
  usuario: UsuarioLista;
  onSaved?: () => void;
}

export function UsuarioEditPanel({ usuario, onSaved }: UsuarioEditPanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const [email, setEmail] = useState(usuario.email);
  const [cargoId, setCargoId] = useState(usuario.cargo_id != null ? String(usuario.cargo_id) : '');
  const [activo, setActivo] = useState(usuario.activo ? '1' : '0');
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loadingCargos, setLoadingCargos] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingCargos(true);
    listarCargos({ pagina: 1, porPagina: 200 })
      .then((res) => {
        if (cancelled) return;
        setCargos(res.cargos.filter((c) => c.empresa_id === usuario.empresa_id));
      })
      .catch(() => {
        if (!cancelled) setCargos([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCargos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [usuario.empresa_id]);

  const cargoOptions = [
    { label: 'Sin cargo', value: '' },
    ...cargos.map((c) => ({ label: c.nombre, value: String(c.id) })),
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await actualizarUsuario(usuario.id, {
        email: email.trim(),
        cargo_id: cargoId ? Number(cargoId) : null,
        activo: activo === '1',
      });
      showNotification({ type: 'success', message: 'Usuario actualizado correctamente' });
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
      <Selector
        id="edit-cargo"
        label="Cargo"
        options={cargoOptions}
        value={cargoId}
        onChange={(v) => setCargoId(String(v))}
        searchable
        disabled={loadingCargos}
      />
      <p className="text-sm text-gray-600 -mt-2">
        Los permisos se heredan del cargo según los roles asignados en &quot;Roles por cargo&quot;.
      </p>
      <Selector
        id="edit-activo"
        label="Estado"
        options={ESTADO_USUARIO_OPTIONS}
        value={activo}
        onChange={(v) => setActivo(String(v))}
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
