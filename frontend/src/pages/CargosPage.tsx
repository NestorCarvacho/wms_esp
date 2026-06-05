import { eliminarCargo, listarCargos } from '@/api/cargos';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Cargo } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function CargosPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const table = usePaginatedCrudTable<Cargo>({
    empresaFilterId: listFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarCargos(params);
      return { total: res.total, items: res.cargos };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar cargos'),
  });

  const tableActions = createCrudTableActions<Cargo>({
    onEdit: (row) => {
      openSidePanel({
        component: 'CargoEditPanel',
        title: 'Editar cargo',
        props: { cargo: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar cargo',
        bodyText: `¿Confirma eliminar el cargo "${row.nombre}"?`,
        successMessage: 'Cargo eliminado',
        onConfirm: async () => {
          await eliminarCargo(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Cargos' }]}
      icon="user"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'CargoCreatePanel',
              title: 'Nuevo cargo',
              props: { onSaved: table.reload },
            })
          }
        >
          Nuevo cargo
        </PrimaryButton>
      </div>

      <CrudEmpresaFilterCard filter={listFilter} className="mb-4" />

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar cargo..."
        {...table.sortProps}
        emptyMessage="No hay cargos."
        actions={tableActions}
      />
    </PageLayout>
  );
}
