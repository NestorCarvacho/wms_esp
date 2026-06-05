import { eliminarUnidadMedida, listarUnidadesMedida } from '@/api/unidadesMedida';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { UnidadMedida } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function UnidadesMedidaPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const table = usePaginatedCrudTable<UnidadMedida>({
    empresaFilterId: listFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarUnidadesMedida(params);
      return { total: res.total, items: res.productos ?? [] };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar unidades de medida'),
  });

  const tableActions = createCrudTableActions<UnidadMedida>({
    onEdit: (row) => {
      openSidePanel({
        component: 'UnidadMedidaEditPanel',
        title: 'Editar unidad de medida',
        props: { unidad: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar unidad de medida',
        bodyText: `¿Confirma eliminar la unidad "${row.nombre}"?`,
        successMessage: 'Unidad de medida eliminada',
        onConfirm: async () => {
          await eliminarUnidadMedida(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Unidades de medida' }]}
      icon="layers"
      supportingText={`${table.total} registradas`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'UnidadMedidaCreatePanel',
              title: 'Nueva unidad de medida',
              props: { onSaved: table.reload },
            })
          }
        >
          Nueva unidad
        </PrimaryButton>
      </div>

      <CrudEmpresaFilterCard filter={listFilter} className="mb-4" />

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'codigo', header: 'Código', render: (row) => <code>{row.codigo}</code> },
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
        searchPlaceholder="Buscar unidad de medida..."
        {...table.sortProps}
        emptyMessage="No hay unidades de medida."
        actions={tableActions}
      />
    </PageLayout>
  );
}
