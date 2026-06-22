import { eliminarEmpresa, listarEmpresas } from '@/api/empresas';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { Feedback, StatusPill } from '@/app/Feedback';
import { useAuthContext } from '@/context/AuthContext';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { useCrudUi } from '@/crud/useCrudUi';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Empresa } from '@/types/api';

function puedeInhabilitar(row: Empresa): boolean {
  return row.esta_activa && !row.es_empresa_maestra;
}

export function EmpresasPage() {
  const { isSuperAdmin } = useAuthContext();
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const table = usePaginatedCrudTable<Empresa>({
    fetchPage: async (params) => {
      if (!isSuperAdmin) return { total: 0, items: [] };
      const res = await listarEmpresas(params);
      return { total: res.total, items: res.empresas };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar empresas'),
  });

  const tableActions = createCrudTableActions<Empresa>({
    onEdit: (row) => {
      openSidePanel({
        component: 'EmpresaEditPanel',
        title: 'Editar empresa',
        props: { empresa: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      if (!puedeInhabilitar(row)) return;
      confirmDelete({
        title: 'Inhabilitar empresa',
        bodyText:
          `¿Inhabilitar "${row.razon_social}"? Los datos se conservan pero dejarán de ` +
          'mostrarse en listados generales hasta que seleccione esta empresa o la reactive.',
        successMessage: 'Empresa inhabilitada',
        onConfirm: async () => {
          await eliminarEmpresa(row.id);
          await table.reload();
        },
      });
    },
    canDelete: puedeInhabilitar,
    deleteLabel: 'Inhabilitar',
  });

  if (!isSuperAdmin) {
    return (
      <PageLayout routes={[{ text: 'Configuración' }, { text: 'Empresas' }]} icon="building">
        <Feedback type="info" message="Esta sección requiere super admin (empresa_id = 1)." />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      routes={[{ text: 'Configuración' }, { text: 'Empresas' }]}
      icon="building"
      supportingText={`${table.total} registradas`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'EmpresaCreatePanel',
              title: 'Nueva empresa',
              props: { onSaved: table.reload },
            })
          }
        >
          Nueva empresa
        </PrimaryButton>
      </div>

      <Table
        data={table.items}
        columns={[
          { key: 'id', header: 'ID', width: 64 },
          { key: 'codigo', header: 'Código', render: (row) => <code>{row.codigo}</code> },
          {
            key: 'razon_social',
            header: 'Razón Social',
            sortable: true,
            render: (row) => (
              <div>
                <span>{row.razon_social}</span>
                {row.nombre_fantasia && (
                  <span className="block text-xs text-gray-400">{row.nombre_fantasia}</span>
                )}
              </div>
            ),
          },
          { key: 'rut', header: 'RUT', render: (row) => row.rut ?? '—' },
          {
            key: 'esta_activa',
            header: 'Estado',
            render: (row) => <StatusPill active={row.esta_activa} />,
          },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar empresa..."
        {...table.sortProps}
        emptyMessage="No hay empresas."
        actions={tableActions}
      />
    </PageLayout>
  );
}
