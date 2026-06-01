import { useCallback, useEffect, useMemo, useState } from 'react';
import { listarBodegas } from '@/api/bodegas';
import { listarTiposZona } from '@/api/tiposZona';
import { eliminarZonaBodega, listarZonasBodega } from '@/api/zonasBodega';
import { PageLayout } from '@/components/layout/PageLayout';
import { PrimaryButton } from '@/components/ui/buttons';
import { Table } from '@/components/ui/tables';
import { StatusPill } from '@/app/Feedback';
import { CrudDynamicFiltersCard } from '@/components/crud/CrudDynamicFiltersCard';
import { createCrudTableActions } from '@/crud/crudTableActions';
import { dependentSelectOptions } from '@/crud/crudFilterHelpers';
import { useCrudUi } from '@/crud/useCrudUi';
import { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';
import { useCrudTableFilters } from '@/crud/useCrudTableFilters';
import { usePaginatedCrudTable } from '@/crud/usePaginatedCrudTable';
import type { Bodega, TipoZona, ZonaBodega } from '@/types/api';
import { displayBodega, displayEmpresa, displayTipoZona } from '@/utils/displayLabels';

const ZONA_FILTER_INITIAL = { bodega: '' } as const;

export function ZonasBodegaPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const tableFilters = useCrudTableFilters({ ...ZONA_FILTER_INITIAL });

  const mapZonaFiltersToParams = useCallback(
    (filters: Record<string, string | number | undefined>) => {
      const bodega = (filters.bodega as string | undefined)?.trim();
      return bodega ? { bodega_id: bodega } : undefined;
    },
    [],
  );

  const table = usePaginatedCrudTable<ZonaBodega>({
    empresaFilterId: listFilter.empresaIdParam,
    filterValues: tableFilters.debouncedValues,
    mapFiltersToParams: mapZonaFiltersToParams,
    fetchPage: async (params) => {
      const res = await listarZonasBodega(params);
      return { total: res.total, items: res.zonas_bodega };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar zonas de bodega'),
  });

  const [bodegasFiltro, setBodegasFiltro] = useState<Bodega[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [tiposZona, setTiposZona] = useState<TipoZona[]>([]);

  const puedeFiltrarBodega = listFilter.puedeFiltrarDependientes;

  useEffect(() => {
    if (!puedeFiltrarBodega) {
      setBodegasFiltro([]);
      return;
    }
    let cancelled = false;
    listarBodegas({
      pagina: 1,
      porPagina: 500,
      ...(listFilter.empresaIdParam != null ? { empresaId: listFilter.empresaIdParam } : {}),
    })
      .then((res) => {
        if (!cancelled) setBodegasFiltro(res.bodegas);
      })
      .catch(() => {
        if (!cancelled) setBodegasFiltro([]);
      });
    return () => {
      cancelled = true;
    };
  }, [puedeFiltrarBodega, listFilter.empresaIdParam]);

  useEffect(() => {
    tableFilters.setFilter('bodega', '');
  }, [listFilter.empresaIdParam]);

  const bodegaFilterOptions = useMemo(
    () =>
      dependentSelectOptions(
        puedeFiltrarBodega,
        bodegasFiltro.map((b) => ({
          label: `${b.nombre}${b.codigo ? ` (${b.codigo})` : ''}`,
          value: String(b.id),
        })),
        { allLabel: 'Todas las bodegas' },
      ),
    [puedeFiltrarBodega, bodegasFiltro],
  );

  const listFilterFields = useMemo(
    () => [
      listFilter.empresaField,
      {
        id: 'bodega',
        label: 'Bodega',
        type: 'selector' as const,
        options: bodegaFilterOptions,
        searchable: true,
        disabled: !puedeFiltrarBodega || bodegasFiltro.length === 0,
      },
    ],
    [listFilter.empresaField, bodegaFilterOptions, puedeFiltrarBodega, bodegasFiltro.length],
  );

  const tableFilterValues = useMemo(
    () => ({
      ...listFilter.filterValues,
      bodega: tableFilters.values.bodega,
    }),
    [listFilter.filterValues, tableFilters.values.bodega],
  );

  const loadEditOptions = useCallback(async () => {
    try {
      const listParams = {
        pagina: 1,
        porPagina: 500,
        ...(listFilter.empresaIdParam != null ? { empresaId: listFilter.empresaIdParam } : {}),
      };
      const [bodegasRes, tiposRes] = await Promise.all([
        listarBodegas(listParams),
        listarTiposZona(listParams),
      ]);
      setBodegas(bodegasRes.bodegas);
      setTiposZona(tiposRes.tipos_zona);
    } catch (err) {
      notifyApiError(err, 'Error al cargar datos del formulario');
      setBodegas([]);
      setTiposZona([]);
    }
  }, [listFilter.empresaIdParam, notifyApiError]);

  useEffect(() => {
    void loadEditOptions();
  }, [loadEditOptions]);

  const tableActions = createCrudTableActions<ZonaBodega>({
    onEdit: (row) => {
      openSidePanel({
        component: 'ZonaBodegaEditPanel',
        title: 'Editar zona de bodega',
        props: { zona: row, bodegas, tiposZona, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      const label = row.nombre || displayBodega(row);
      confirmDelete({
        title: 'Eliminar zona de bodega',
        bodyText: `¿Confirma eliminar la zona "${label}"?`,
        successMessage: 'Zona eliminada',
        onConfirm: async () => {
          await eliminarZonaBodega(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Inventario' }, { text: 'Almacén' }, { text: 'Zonas de bodega' }]}
      icon="layers"
      supportingText={`${table.total} registradas`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'ZonaBodegaCreatePanel',
              title: 'Nueva zona de bodega',
              props: { empresaId: listFilter.empresaIdParam, onSaved: table.reload },
            })
          }
        >
          Nueva zona
        </PrimaryButton>
      </div>

      <CrudDynamicFiltersCard
        fields={listFilterFields}
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
          { key: 'id', header: 'ID', width: 64 },
          {
            key: 'nombre',
            header: 'Nombre',
            sortable: true,
            render: (row) => row.nombre || '—',
          },
          { key: 'bodega_id', header: 'Bodega', render: (row) => displayBodega(row) },
          { key: 'tipo_zona_id', header: 'Tipo', render: (row) => displayTipoZona(row) },
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
        searchPlaceholder="Buscar zona de bodega..."
        serverSideSort
        emptyMessage="No hay zonas de bodega registradas."
        actions={tableActions}
      />
    </PageLayout>
  );
}
