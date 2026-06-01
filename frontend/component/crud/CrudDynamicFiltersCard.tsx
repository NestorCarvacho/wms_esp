import { DynamicFiltersCard, type FilterField } from '@/components/ui/cards/DynamicFiltersCard';
import { LabelInput } from '@/components/ui/inputs/LabelInput';
import { Selector } from '@/components/ui/inputs/Selector';

export interface CrudFilterFieldDef {
  id: string;
  label: string;
  type: 'input' | 'selector';
  placeholder?: string;
  options?: { label: string; value: string; searchTokens?: string }[];
  hidden?: boolean;
  colSpan?: 1 | 2 | 3 | 4;
  searchable?: boolean;
  disabled?: boolean;
}

interface CrudDynamicFiltersCardProps {
  fields: CrudFilterFieldDef[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  className?: string;
  columns?: 2 | 3 | 4;
  actions?: React.ReactNode;
  header?: React.ReactNode;
}

/**
 * Barra de filtros CRUD usando `DynamicFiltersCard` (patrón hooks_ejemplos / ui/filters).
 * Colócala encima de `Table`, no dentro del slot de la tabla.
 */
export function CrudDynamicFiltersCard({
  fields,
  values,
  onChange,
  className = 'mb-4',
  columns = 4,
  actions,
  header,
}: CrudDynamicFiltersCardProps) {
  const filterFields: FilterField[] = fields
    .filter((field) => !field.hidden)
    .map((field) => ({
      id: field.id,
      type: field.type === 'input' ? 'input' : 'selector',
      label: field.label,
      colSpan: field.colSpan,
      component:
        field.type === 'input' ? (
          <LabelInput
            id={`filter-${field.id}`}
            label={field.label}
            value={values[field.id] ?? ''}
            onChange={(v) => onChange(field.id, v)}
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        ) : (
          <Selector
            id={`filter-${field.id}`}
            label={field.label}
            options={field.options ?? []}
            value={values[field.id] ?? ''}
            onChange={(v) => onChange(field.id, String(v))}
            searchable={field.searchable}
            disabled={field.disabled}
            className="min-w-0"
          />
        ),
    }));

  if (filterFields.length === 0) return null;

  return (
    <DynamicFiltersCard
      fields={filterFields}
      className={className}
      columns={columns}
      actions={actions}
      header={header}
    />
  );
}
