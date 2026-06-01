import { CrudDynamicFiltersCard } from '@/components/crud/CrudDynamicFiltersCard';
import type { useCrudEmpresaFilterCard } from '@/crud/useCrudEmpresaFilterCard';

type EmpresaFilterCard = ReturnType<typeof useCrudEmpresaFilterCard>;

interface CrudEmpresaFilterCardProps {
  filter: EmpresaFilterCard;
  className?: string;
}

/** Tarjeta con solo el filtro de empresa (empresa maestra). */
export function CrudEmpresaFilterCard({ filter, className }: CrudEmpresaFilterCardProps) {
  if (!filter.showFilter) return null;

  return (
    <CrudDynamicFiltersCard
      className={className}
      fields={[filter.empresaField]}
      values={filter.filterValues}
      onChange={filter.handleFilterChange}
    />
  );
}
