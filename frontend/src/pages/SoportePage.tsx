import { useCallback, useMemo } from 'react';
import { listarTickets } from '@/api/tickets';
import { PageLayout } from '@/components/layout/PageLayout';
import { Table } from '@/components/ui/tables';
import { CrudDynamicFiltersCard } from '@/components/crud/CrudDynamicFiltersCard';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { useCrudTableFilters } from '@/crud/useCrudTableFilters';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Ticket } from '@/types/api';

const FILTRO_INICIAL = { estado: 'abiertos' } as const;

export function SoportePage() {
  const { notifyApiError, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const tableFilters = useCrudTableFilters({ ...FILTRO_INICIAL });

  const mapFiltersToParams = useCallback((filters: Record<string, string | number | undefined>) => {
    const estado = String(filters.estado ?? 'abiertos');
    if (estado === 'cerrados') return { es_abierto: 'false' };
    if (estado === 'abiertos') return { es_abierto: 'true' };
    return undefined;
  }, []);

  const table = usePaginatedCrudTable<Ticket>({
    empresaFilterId: listFilter.empresaIdParam,
    filterValues: tableFilters.debouncedValues,
    mapFiltersToParams,
    fetchPage: async (params) => {
      const res = await listarTickets(params);
      return { total: res.total, items: res.tickets };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar tickets'),
  });

  const fields = useMemo(
    () => [
      listFilter.empresaField,
      {
        id: 'estado',
        label: 'Estado',
        type: 'selector' as const,
        options: [
          { value: 'abiertos', label: 'Abiertos' },
          { value: 'cerrados', label: 'Cerrados' },
        ],
      },
    ],
    [listFilter.empresaField],
  );

  const tableFilterValues = useMemo(
    () => ({
      ...listFilter.filterValues,
      ...tableFilters.values,
    }),
    [listFilter.filterValues, tableFilters.values],
  );

  function abrir(row: Ticket) {
    openSidePanel({
      component: 'TicketGestionPanel',
      title: `Ticket #${row.id}`,
      props: { ticketId: row.id, onSaved: table.reload },
    });
  }

  return (
    <PageLayout
      routes={[{ text: 'Configuración' }, { text: 'Mesa de ayuda' }]}
      icon="info"
      supportingText={`${table.total} tickets`}
    >
      <CrudDynamicFiltersCard
        fields={fields}
        values={tableFilterValues}
        onChange={(id, value) => {
          if (id === 'empresa') {
            listFilter.handleEmpresaChange(value);
            return;
          }
          tableFilters.setFilter(id, value);
        }}
      />

      <Table
        data={table.items}
        columns={[
          { key: 'creado_at_local', header: 'Fecha', render: (row) => row.creado_at_local ?? '' },
          { key: 'nombre_empresa', header: 'Empresa' },
          { key: 'nombre_solicitante', header: 'Solicitante' },
          { key: 'tipo_solicitud_nombre', header: 'Tipo' },
          { key: 'asunto', header: 'Asunto' },
          { key: 'estado_nombre', header: 'Estado' },
          {
            key: 'ultimo_mensaje',
            header: 'Último mensaje',
            render: (row) => (
              <span className="line-clamp-2 text-sm text-muted-foreground">{row.ultimo_mensaje ?? ''}</span>
            ),
          },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar ticket..."
        emptyMessage="No hay tickets."
        actions={[
          {
            id: 'abrir',
            label: 'Abrir',
            icon: 'eye',
            onClick: abrir,
          },
        ]}
      />
    </PageLayout>
  );
}
