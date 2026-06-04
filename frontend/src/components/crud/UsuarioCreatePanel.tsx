import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { crearUsuario } from '@/api/usuarios';
import { listarCargos } from '@/api/cargos';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { useUI } from '@/hooks/ui';
import { ApiError } from '@/api/client';
import { useAuthContext } from '@/context/AuthContext';
import { useEmpresaMaestraFilter } from '@/crud/useEmpresaMaestraFilter';
import type { Cargo } from '@/types/api';
import { empresaComboBoxOption } from '@/utils/displayLabels';
import { CrudPanelFooter } from './CrudPanelFooter';

export interface UsuarioCreatePanelProps {
  onSaved?: () => void;
}

export function UsuarioCreatePanel({ onSaved }: UsuarioCreatePanelProps) {
  const { closeSidePanel, showNotification } = useUI();
  const { isSuperAdmin, user } = useAuthContext();
  const listFilter = useEmpresaMaestraFilter();
  const defaultEmpresaId = user?.empresa_id ? String(user.empresa_id) : '';

  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [empresaId, setEmpresaId] = useState(listFilter.empresaFilterId || defaultEmpresaId);
  const [cargoId, setCargoId] = useState('');
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const empresaIdParaCargos = isSuperAdmin ? empresaId : defaultEmpresaId;

  useEffect(() => {
    setEmpresaId(listFilter.empresaFilterId || defaultEmpresaId);
  }, [listFilter.empresaFilterId, defaultEmpresaId]);

  useEffect(() => {
    if (!empresaIdParaCargos) {
      setCargos([]);
      return;
    }
    let cancelled = false;
    setLoadingCargos(true);
    listarCargos({
      pagina: 1,
      porPagina: 200,
      empresaId: listFilter.empresaIdParam,
    })
      .then((res) => {
        if (cancelled) return;
        setCargos(res.cargos.filter((c) => c.empresa_id === Number(empresaIdParaCargos)));
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
  }, [empresaIdParaCargos, listFilter.empresaIdParam]);

  const cargoOptions = useMemo(
    () => [
      { label: 'Sin cargo', value: '' },
      ...cargos.map((c) => ({ label: c.nombre, value: String(c.id) })),
    ],
    [cargos],
  );

  const empresaOptions = useMemo(
    () =>
      listFilter.empresas.map((e) => {
        const opt = empresaComboBoxOption({ ...e, id: e.id });
        return { label: opt.label, value: opt.value, searchTokens: opt.searchTokens };
      }),
    [listFilter.empresas],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearUsuario({
        email: email.trim(),
        contrasena,
        ...(cargoId ? { cargo_id: Number(cargoId) } : {}),
        ...(isSuperAdmin ? { empresa_id: Number(empresaId) } : {}),
      });
      showNotification({ type: 'success', message: 'Usuario creado correctamente' });
      onSaved?.();
      closeSidePanel();
    } catch (err) {
      showNotification({
        type: 'error',
        message: err instanceof ApiError ? err.message : 'Error al crear usuario',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LabelInput id="create-email" label="Email" type="email" value={email} onChange={setEmail} required />
      <LabelInput id="create-contrasena" label="Contraseña" type="password" value={contrasena} onChange={setContrasena} required />
      {isSuperAdmin && (
        <ComboBox
          id="create-empresaId"
          label="Empresa"
          options={empresaOptions}
          value={empresaId}
          onChange={(v) => {
            setEmpresaId(String(v));
            setCargoId('');
          }}
          searchable
          required
          disabled={listFilter.loading || empresaOptions.length === 0}
        />
      )}
      <ComboBox
        id="create-cargoId"
        label="Cargo"
        options={cargoOptions}
        value={cargoId}
        onChange={(v) => setCargoId(String(v))}
        searchable
        disabled={loadingCargos}
      />
      <CrudPanelFooter
        submitting={submitting}
        disabled={isSuperAdmin && (!empresaId || empresaOptions.length === 0)}
        submitLabel="Guardar usuario"
      />
    </form>
  );
}
