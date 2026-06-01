import { listarPermisos } from '@/api/permisos';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { CrudEmpresaFilterCard } from '@/components/crud/CrudEmpresaFilterCard';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { useEmpresaMaestraCreateForm } from '@/crud/useEmpresaMaestraCreateForm';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Permiso } from '@/types/api';
import { displayEmpresa } from '@/utils/displayLabels';

export function PermisosPage() {
  const { notifyApiError, openSidePanel } = useCrudUi();
  const empresaCreate = useEmpresaMaestraCreateForm();
  const listFilter = useCrudEmpresaFilterCard();
  const table = usePaginatedCrudTable<Permiso>({
    empresaFilterId: listFilter.empresaIdParam,
    fetchPage: async (params) => {
      const res = await listarPermisos(params);
      return { total: res.total, items: res.permisos };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar permisos'),
  });

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Permisos' }]}
      icon="lock"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'PermisoCreatePanel',
              title: 'Nuevo permiso',
              props: { onSaved: table.reload },
            })
          }
        >
          Nuevo permiso
        </PrimaryButton>
      </div>

      <CrudEmpresaFilterCard filter={listFilter} className="mb-4" />

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'codigo', header: 'Código', sortable: true, render: (row) => <code>{row.codigo}</code> },
          { key: 'descripcion', header: 'Descripción', render: (row) => row.descripcion ?? '—' },
          ...(empresaCreate.showEmpresaField
            ? [{ key: 'empresa_id' as const, header: 'Empresa', render: (row: Permiso) => displayEmpresa(row) }]
            : []),
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar permiso..."
        serverSideSort
        emptyMessage="No hay permisos."
      />
    </PageLayout>
  );
}
