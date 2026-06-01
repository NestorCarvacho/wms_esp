import { useCallback, useMemo } from 'react';
import type { CrudFilterFieldDef } from '@/components/crud/CrudDynamicFiltersCard';
import { useEmpresaMaestraFilter } from '@/crud/useEmpresaMaestraFilter';

/** Filtro de empresa en tarjeta CRUD (listados multiempresa). */
export function useCrudEmpresaFilterCard() {
  const empresaFilter = useEmpresaMaestraFilter();

  const puedeFiltrarDependientes =
    !empresaFilter.showFilter || Boolean(empresaFilter.empresaFilterId);

  const empresaField: CrudFilterFieldDef = useMemo(
    () => ({
      id: 'empresa',
      label: 'Empresa',
      type: 'selector',
      options: empresaFilter.filterOptions,
      hidden: !empresaFilter.showFilter,
      searchable: true,
      disabled: empresaFilter.loading,
    }),
    [empresaFilter.filterOptions, empresaFilter.loading, empresaFilter.showFilter],
  );

  const handleEmpresaChange = useCallback(
    (value: string) => {
      empresaFilter.setEmpresaFilterId(value);
    },
    [empresaFilter.setEmpresaFilterId],
  );

  const handleFilterChange = useCallback(
    (id: string, value: string) => id === 'empresa' && handleEmpresaChange(value),
    [handleEmpresaChange],
  );

  const filterValues = useMemo(
    () => ({ empresa: empresaFilter.empresaFilterId }),
    [empresaFilter.empresaFilterId],
  );

  return {
    ...empresaFilter,
    puedeFiltrarDependientes,
    empresaField,
    filterValues,
    handleEmpresaChange,
    handleFilterChange,
  };
}
