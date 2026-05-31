import React from 'react';
import { Card } from './Card';


export interface FilterField {
  /**
   * Unique identifier for the filter field
   */
  id: string;
  /**
   * Type of filter field
   */
  type: 'selector' | 'dateRange' | 'input' | 'custom';
  /**
   * Label for the filter field
   */
  label?: string;
  /**
   * Number of columns to span (1-4)
   */
  colSpan?: 1 | 2 | 3 | 4;
  /**
   * Custom component to render
   */
  component: React.ReactNode;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field should be hidden
   */
  hidden?: boolean;
}

export interface DynamicFiltersCardProps {
  /**
   * Array of filter fields to render
   */
  fields: FilterField[];
  /**
   * Actions to display (typically search and export buttons)
   */
  actions?: React.ReactNode;
  /**
   * Header content (e.g., radio buttons for search mode)
   */
  header?: React.ReactNode;
  /**
   * Additional CSS classes for the card
   */
  className?: string;
  /**
   * Number of columns in the grid (default: 4)
   */
  columns?: 2 | 3 | 4;
}

/**
 * DynamicFiltersCard component
 * Flexible card component for rendering dynamic filter fields in a grid layout
 * 
 * @example
 * ```tsx
 * <DynamicFiltersCard
 *   header={<RadioButtonGroup options={[...]} />}
 *   fields={[
 *     { id: 'year', type: 'selector', component: <Selector ... />, colSpan: 1 },
 *     { id: 'dateRange', type: 'dateRange', component: <DateRangePicker ... />, colSpan: 2 }
 *   ]}
 *   actions={<div><PrimaryButton>Buscar</PrimaryButton></div>}
 * />
 * ```
 */
export const DynamicFiltersCard: React.FC<DynamicFiltersCardProps> = ({
  fields,
  actions,
  header,
  className = '',
  columns = 4,
}) => {
  const visibleFields = fields.filter(field => !field.hidden);

  const getColSpanClass = (colSpan: number = 1) => {
    const spanMap = {
      1: 'lg:col-span-1',
      2: 'lg:col-span-2',
      3: 'lg:col-span-3',
      4: 'lg:col-span-4',
    };
    return spanMap[colSpan as keyof typeof spanMap] || 'lg:col-span-1';
  };

  const getGridColsClass = () => {
    const colsMap = {
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
    };
    return colsMap[columns];
  };

  return (
    <Card className={className} padding="2rem">
      {/* Header section */}
      {header && (
        <div className="mb-6">
          {header}
        </div>
      )}

      {/* Filters and Actions container */}
      <div className="flex flex-wrap gap-4 justify-between items-end">
        {/* Dynamic filter fields grid */}
        <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 ${getGridColsClass()} gap-4`}>
          {visibleFields.map((field) => (
            <div
              key={field.id}
              className={getColSpanClass(field.colSpan)}
              data-testid={`filter-field-${field.id}`}
            >
              {field.component}
            </div>
          ))}
        </div>

        {/* Actions section */}
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DynamicFiltersCard;
