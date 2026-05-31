import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { crearUsuario, eliminarUsuario, listarUsuarios } from '@/api/usuarios';
import { listarEmpresas } from '@/api/empresas';
import { listarCargos } from '@/api/cargos';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { useAuthContext } from '@/context/AuthContext';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Cargo, Empresa, UsuarioLista } from '@/types/api';
import { displayCargo, displayEmpresa } from '@/utils/displayLabels';

export function UsuariosPage() {
  const { isSuperAdmin, user } = useAuthContext();
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const defaultEmpresaId = user?.empresa_id ? String(user.empresa_id) : '';
  const table = usePaginatedCrudTable<UsuarioLista>({
    fetchPage: async (params) => {
      const res = await listarUsuarios(params);
      return { total: res.total, items: res.usuarios };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar usuarios'),
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [empresaId, setEmpresaId] = useState(defaultEmpresaId);
  const [cargoId, setCargoId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEmpresas = useCallback(async () => {
    if (!isSuperAdmin) return;
    setLoadingEmpresas(true);
    try {
      const res = await listarEmpresas({ pagina: 1, porPagina: 100 });
      setEmpresas(res.empresas.filter((e) => e.esta_activa));
    } catch (err) {
      notifyApiError(err, 'Error al cargar empresas');
    } finally {
      setLoadingEmpresas(false);
    }
  }, [isSuperAdmin, notifyApiError]);

  useEffect(() => {
    if (isSuperAdmin) loadEmpresas();
  }, [isSuperAdmin, loadEmpresas]);

  useEffect(() => {
    if (defaultEmpresaId) setEmpresaId(defaultEmpresaId);
  }, [defaultEmpresaId]);

  const empresaIdParaCargos = isSuperAdmin ? empresaId : defaultEmpresaId;

  useEffect(() => {
    if (!empresaIdParaCargos) {
      setCargos([]);
      return;
    }
    let cancelled = false;
    setLoadingCargos(true);
    listarCargos({ pagina: 1, porPagina: 200 })
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
  }, [empresaIdParaCargos]);

  const cargoOptions = useMemo(
    () => [
      { label: 'Sin cargo', value: '' },
      ...cargos.map((c) => ({ label: c.nombre, value: String(c.id) })),
    ],
    [cargos],
  );

  const empresaOptions = empresas.map((e) => ({
    label: `${e.codigo} — ${e.nombre}`,
    value: String(e.id),
  }));

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearUsuario({
        email: email.trim(),
        contrasena,
        ...(cargoId ? { cargo_id: Number(cargoId) } : {}),
        ...(isSuperAdmin ? { empresa_id: Number(empresaId) } : {}),
      });
      setEmail('');
      setContrasena('');
      setCargoId('');
      setEmpresaId(defaultEmpresaId);
      setShowForm(false);
      notifySuccess('Usuario creado correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<UsuarioLista>({
    onEdit: (row) => {
      openSidePanel({
        component: 'UsuarioEditPanel',
        title: 'Editar usuario',
        props: { usuario: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar usuario',
        bodyText: `¿Confirma eliminar el usuario "${row.email}"?`,
        successMessage: 'Usuario eliminado',
        onConfirm: async () => {
          await eliminarUsuario(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Usuarios' }]}
      icon="user"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() => {
            if (!showForm) {
              setEmpresaId(defaultEmpresaId);
              setCargoId('');
            }
            setShowForm((v) => !v);
          }}
        >
          {showForm ? 'Cancelar' : 'Nuevo usuario'}
        </PrimaryButton>
      </div>

      {showForm && (
        <FormLayout onSubmit={handleCreate} columns={2} className="mb-6">
          <FormLayout.Section title="Datos del usuario">
            <LabelInput id="email" label="Email" type="email" value={email} onChange={setEmail} required />
            <LabelInput id="contrasena" label="Contraseña" type="password" value={contrasena} onChange={setContrasena} required />
            {isSuperAdmin && (
              <Selector
                id="empresaId"
                label="Empresa"
                options={empresaOptions}
                value={empresaId}
                onChange={(v) => {
                  setEmpresaId(String(v));
                  setCargoId('');
                }}
                searchable
                required
                disabled={loadingEmpresas || empresaOptions.length === 0}
              />
            )}
            <Selector
              id="cargoId"
              label="Cargo"
              options={cargoOptions}
              value={cargoId}
              onChange={(v) => setCargoId(String(v))}
              searchable
              disabled={loadingCargos}
            />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton
                type="submit"
                colorVariant="success"
                isLoading={submitting}
                disabled={isSuperAdmin && (!empresaId || empresaOptions.length === 0)}
              >
                Guardar usuario
              </PrimaryButton>
            }
          />
        </FormLayout>
      )}

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'email', header: 'Email', sortable: true },
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
          { key: 'cargo_id', header: 'Cargo', render: (row) => displayCargo(row) },
          { key: 'activo', header: 'Estado', render: (row) => <StatusPill active={row.activo} /> },
          {
            key: 'ultimo_login',
            header: 'Último login',
            render: (row) =>
              row.ultimo_login ? new Date(row.ultimo_login).toLocaleString('es-CL') : '—',
          },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar usuario..."
        serverSideSort
        emptyMessage="No hay usuarios."
        actions={tableActions}
      />
    </PageLayout>
  );
}
