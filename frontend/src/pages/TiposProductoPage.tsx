import { eliminarTipoProducto, listarTiposProducto } from '@/api/tiposProducto';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { TipoProducto } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function TiposProductoPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const table = usePaginatedCrudTable<TipoProducto>({
    empresaFilterId: listFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarTiposProducto(params);
      return { total: res.total, items: res.tipos_producto };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar tipos de producto'),
  });

  const tableActions = createCrudTableActions<TipoProducto>({
    onEdit: (row) => {
      openSidePanel({
        component: 'TipoProductoEditPanel',
        title: 'Editar tipo de producto',
        props: { tipoProducto: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar tipo de producto',
        bodyText: `¿Confirma eliminar el tipo "${row.nombre}"?`,
        successMessage: 'Tipo de producto eliminado',
        onConfirm: async () => {
          await eliminarTipoProducto(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Catálogo' }, { text: 'Tipos de producto' }]}
      icon="layers"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'TipoProductoCreatePanel',
              title: 'Nuevo tipo de producto',
              props: { onSaved: table.reload },
            })
          }
        >
          Nuevo tipo
        </PrimaryButton>
      </div>

      <CrudEmpresaFilterCard filter={listFilter} className="mb-4" />

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'nombre', header: 'Nombre', sortable: true },
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
        searchPlaceholder="Buscar tipo..."
        serverSideSort
        emptyMessage="No hay tipos de producto."
        actions={tableActions}
      />
    </PageLayout>
  );
}
