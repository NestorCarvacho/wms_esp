import { eliminarTipoZona, listarTiposZona } from '@/api/tiposZona';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { TipoZona } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function TiposZonaPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const table = usePaginatedCrudTable<TipoZona>({
    empresaFilterId: listFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarTiposZona(params);
      return { total: res.total, items: res.tipos_zona };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar tipos de zona'),
  });

  const tableActions = createCrudTableActions<TipoZona>({
    onEdit: (row) => {
      openSidePanel({
        component: 'TipoZonaEditPanel',
        title: 'Editar tipo de zona',
        props: { tipoZona: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar tipo de zona',
        bodyText: `¿Confirma eliminar el tipo "${row.nombre}"?`,
        successMessage: 'Tipo de zona eliminado',
        onConfirm: async () => {
          await eliminarTipoZona(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Almacén' }, { text: 'Tipos de zona' }]}
      icon="layers"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'TipoZonaCreatePanel',
              title: 'Nuevo tipo de zona',
              props: { onSaved: table.reload },
            })
          }
        >
          Nuevo tipo de zona
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
        searchPlaceholder="Buscar tipo de zona..."
        serverSideSort
        emptyMessage="No hay tipos de zona. Crea el primero (ej. Picking, Recepción)."
        actions={tableActions}
      />
    </PageLayout>
  );
}
