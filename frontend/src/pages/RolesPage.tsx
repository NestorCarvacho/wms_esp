import { useEffect, useState, type FormEvent } from 'react';
import { crearRol, eliminarRol, listarRoles } from '@/api/roles';
import { listarPermisos } from '@/api/permisos';
import { PageLayout } from '@/components/layout/PageLayout';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Permiso, Rol } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function RolesPage() {
  const { notifySuccess, notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const table = usePaginatedCrudTable<Rol>({
    fetchPage: async (params) => {
      const res = await listarRoles(params);
      return { total: res.total, items: res.roles };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar roles'),
  });
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listarPermisos({ pagina: 1, porPagina: 500 })
      .then((res) => {
        if (!cancelled) setPermisos(res.permisos);
      })
      .catch((err) => {
        if (!cancelled) notifyApiError(err, 'Error al cargar permisos');
      });
    return () => {
      cancelled = true;
    };
  }, [notifyApiError]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await crearRol({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo: 1,
      });
      setNombre('');
      setDescripcion('');
      setShowForm(false);
      notifySuccess('Rol creado correctamente');
      await table.reload();
    } catch (err) {
      notifyApiError(err, 'Error al crear rol');
    } finally {
      setSubmitting(false);
    }
  }

  const tableActions = createCrudTableActions<Rol>({
    onEdit: (row) => {
      openSidePanel({
        component: 'RolEditPanel',
        title: 'Editar rol',
        props: { rol: row, permisos, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar rol',
        bodyText: `¿Confirma eliminar el rol "${row.nombre}"?`,
        successMessage: 'Rol eliminado',
        onConfirm: async () => {
          await eliminarRol(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Roles' }]}
      icon="lock"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : 'Nuevo rol'}
        </PrimaryButton>
      </div>

      {showForm && (
        <FormLayout onSubmit={handleCreate} columns={2} className="mb-6">
          <FormLayout.Section title="Datos del rol">
            <LabelInput id="nombre" label="Nombre" value={nombre} onChange={setNombre} required />
            <LabelInput id="descripcion" label="Descripción" value={descripcion} onChange={setDescripcion} required />
          </FormLayout.Section>
          <FormLayout.Footer
            primaryButton={
              <PrimaryButton type="submit" colorVariant="success" isLoading={submitting}>
                Guardar rol
              </PrimaryButton>
            }
          />
        </FormLayout>
      )}

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'descripcion', header: 'Descripción', render: (row) => row.descripcion ?? '—' },
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
          { key: 'activo', header: 'Estado', render: (row) => <StatusPill active={row.activo} /> },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar rol..."
        serverSideSort
        emptyMessage="No hay roles."
        actions={tableActions}
      />
    </PageLayout>
  );
}
