import { useCallback, useEffect, useMemo, useState } from 'react';
import { eliminarUsuario, listarUsuarios } from '@/api/usuarios';
import { listarCargos } from '@/api/cargos';
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
import type { Cargo, UsuarioLista } from '@/types/api';
import { displayCargo, displayEmpresa } from '@/utils/displayLabels';

const USUARIO_FILTER_INITIAL = { cargo: '' } as const;

export function UsuariosPage() {
  const { notifyApiError, confirmDelete, openSidePanel } = useCrudUi();
  const listFilter = useCrudEmpresaFilterCard();
  const tableFilters = useCrudTableFilters({ ...USUARIO_FILTER_INITIAL });

  const mapUsuarioFiltersToParams = useCallback(
    (filters: Record<string, string | number | undefined>) => {
      const cargo = (filters.cargo as string | undefined)?.trim();
      return cargo ? { cargo_id: cargo } : undefined;
    },
    [],
  );

  const table = usePaginatedCrudTable<UsuarioLista>({
    empresaFilterId: listFilter.empresaIdParam,
    filterValues: tableFilters.debouncedValues,
    mapFiltersToParams: mapUsuarioFiltersToParams,
    fetchPage: async (params) => {
      const res = await listarUsuarios(params);
      return { total: res.total, items: res.usuarios };
    },
    onError: (err) => notifyApiError(err, 'Error al cargar usuarios'),
  });

  const [cargosFiltro, setCargosFiltro] = useState<Cargo[]>([]);
  const puedeFiltrarCargo = listFilter.puedeFiltrarDependientes;

  useEffect(() => {
    if (!puedeFiltrarCargo) {
      setCargosFiltro([]);
      return;
    }
    let cancelled = false;
    listarCargos({
      pagina: 1,
      porPagina: 500,
      ...(listFilter.empresaIdParam != null ? { empresaId: listFilter.empresaIdParam } : {}),
    })
      .then((res) => {
        if (!cancelled) setCargosFiltro(res.cargos);
      })
      .catch(() => {
        if (!cancelled) setCargosFiltro([]);
      });
    return () => {
      cancelled = true;
    };
  }, [puedeFiltrarCargo, listFilter.empresaIdParam]);

  useEffect(() => {
    tableFilters.setFilter('cargo', '');
  }, [listFilter.empresaIdParam]);

  const cargoFilterOptions = useMemo(
    () =>
      dependentSelectOptions(
        puedeFiltrarCargo,
        cargosFiltro.map((c) => ({ label: c.nombre, value: String(c.id) })),
        { allLabel: 'Todos los cargos' },
      ),
    [puedeFiltrarCargo, cargosFiltro],
  );

  const listFilterFields = useMemo(
    () => [
      listFilter.empresaField,
      {
        id: 'cargo',
        label: 'Cargo',
        type: 'selector' as const,
        options: cargoFilterOptions,
        searchable: true,
        disabled: !puedeFiltrarCargo || cargosFiltro.length === 0,
      },
    ],
    [listFilter.empresaField, cargoFilterOptions, puedeFiltrarCargo, cargosFiltro.length],
  );

  const tableFilterValues = useMemo(
    () => ({
      ...listFilter.filterValues,
      cargo: tableFilters.values.cargo,
    }),
    [listFilter.filterValues, tableFilters.values.cargo],
  );

  const tableActions = createCrudTableActions<UsuarioLista>({
    onEdit: (row) => {
      openSidePanel({
        component: 'UsuarioEditPanel',
        title: 'Editar usuario',
        props: { usuario: row, onSaved: table.reload },
      });
    },
    onDelete: (row) => {
      confirmDelete({
        title: 'Eliminar usuario',
        bodyText: `¿Confirma eliminar el usuario "${row.email}"?`,
        successMessage: 'Usuario eliminado',
        onConfirm: async () => {
          await eliminarUsuario(row.id);
          await table.reload();
        },
      });
    },
  });

  return (
    <PageLayout
      routes={[{ text: 'Administración' }, { text: 'Usuarios' }]}
      icon="user"
      supportingText={`${table.total} registrados`}
    >
      <div className="flex justify-end mb-4">
        <PrimaryButton
          onClick={() =>
            openSidePanel({
              component: 'UsuarioCreatePanel',
              title: 'Nuevo usuario',
              props: { onSaved: table.reload },
            })
          }
        >
          Nuevo usuario
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
          { key: 'email', header: 'Email', sortable: true },
          { key: 'empresa_id', header: 'Empresa', render: (row) => displayEmpresa(row) },
          { key: 'cargo_id', header: 'Cargo', render: (row) => displayCargo(row) },
          { key: 'activo', header: 'Estado', render: (row) => <StatusPill active={row.activo} /> },
          {
            key: 'ultimo_login',
            header: 'Último login',
            render: (row) =>
              row.ultimo_login ? new Date(row.ultimo_login).toLocaleString('es-CL') : '—',
          },
        ]}
        totalRows={table.total}
        isLoading={table.loading}
        pagination={table.pagination}
        onSearch={table.handleSearch}
        searchPlaceholder="Buscar usuario..."
        serverSideSort
        emptyMessage="No hay usuarios."
        actions={tableActions}
      />
    </PageLayout>
  );
}
