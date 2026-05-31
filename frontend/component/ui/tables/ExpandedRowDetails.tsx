import React from 'react';
import { Text } from '@/components/ui/text/Text';
import { TABLE_PALETTE } from './Table.constants';
import type { DetailField } from './Table.types';


export interface ExpandedRowDetailsProps {
  fields: DetailField[];
  className?: string;
}

/**
 * Generic component for rendering expanded row details in a Table
 * Displays key-value pairs with consistent styling
 * 
 * @example
 * ```tsx
 * <ExpandedRowDetails
 *   fields={[
 *     { label: 'Overtime Type', value: record.overtimeType },
 *     { label: 'Observation', value: record.observation, defaultValue: 'None' },
 *   ]}
 * />
 * ```
 */
export const ExpandedRowDetails: React.FC<ExpandedRowDetailsProps> = ({
  fields,
  className = '',
}) => (
  <div className={`py-2 border-t border-gray-200 ${className}`}>
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={index}>
          <Text variant="small-medium" color={TABLE_PALETTE.headerText} className="inline">
            {field.label}:{' '}
          </Text>
          <Text variant="small-medium" color={TABLE_PALETTE.rowText} className="inline whitespace-pre-line">
            {field.value || field.defaultValue || '-'}
          </Text>
        </div>
      ))}
    </div>
  </div>
);
