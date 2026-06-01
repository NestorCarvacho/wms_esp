import { eliminarBodega, listarBodegas } from '@/api/bodegas';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Bodega } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function BodegasPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const table = usePaginatedCrudTable<Bodega>({
    empresaFilterId: listFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarBodegas(params);
      return { total: res.total, items: res.bodegas };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar bodegas'),
  });

  const tableActions = createCrudTableActions<Bodega>({
    onEdit: (row) => {
      openSidePanel({
        component: 'BodegaEditPanel',
        title: 'Editar bodega',
        props: { bodega: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar bodega',
        bodyText: `¿Confirma eliminar la bodega "${row.nombre}"?`,
        successMessage: 'Bodega eliminada',
        onConfirm: async () => {
          await eliminarBodega(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Bodegas' }]}
      icon="building"
      supportingText={`${table.total} registradas`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'BodegaCreatePanel',
              title: 'Nueva bodega',
              props: { onSaved: table.reload },
            })
          }
        >
          Nueva bodega
        </PrimaryButton>
      </div>

      <CrudEmpresaFilterCard filter={listFilter} className="mb-4" />

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'nombre', header: 'Nombre', sortable: true },
          { key: 'codigo', header: 'Código', render: (row) => <code>{row.codigo}</code> },
          {
            key: 'activo',
            header: 'Estado',
            render: (row) => <StatusPill active={row.activo ?? 1} />,
          },
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar bodega..."
        serverSideSort
        emptyMessage="No hay bodegas. Crea la primera."
        actions={tableActions}
      />
    </PageLayout>
  );
}
