import { useCallback, useEffect, useState } from 'react';
import { eliminarRol, listarRoles } from '@/api/roles';
import { listarPermisos } from '@/api/permisos';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Permiso, Rol } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function RolesPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const table = usePaginatedCrudTable<Rol>({
    empresaFilterId: listFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarRoles(params);
      return { total: res.total, items: res.roles };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar roles'),
  });
  const [permisos, setPermisos] = useState<Permiso[]>([]);

  const loadPermisos = useCallback(async () => {
    try {
      const res = await listarPermisos({ pagina: 1, porPagina: 500 });
      setPermisos(res.permisos);
    } catch (err) {
      notifyApiError(err, 'Error al cargar permisos');
    }
  }, [notifyApiError]);

  useEffect(() => {
    void loadPermisos();
  }, [loadPermisos]);

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
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'RolCreatePanel',
              title: 'Nuevo rol',
              props: { onSaved: table.reload },
            })
          }
        >
          Nuevo rol
        </PrimaryButton>
      </div>

      <CrudEmpresaFilterCard filter={listFilter} className="mb-4" />

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
        {...table.sortProps}
        emptyMessage="No hay roles."
        actions={tableActions}
      />
    </PageLayout>
  );
}
