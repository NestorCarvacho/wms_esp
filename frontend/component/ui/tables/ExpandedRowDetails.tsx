import React from 'react';
import { Text } from '@/components/ui/text/Text';
import type { DetailField } from './Table.types';


export interface ExpandedRowDetailsProps {
  fields: DetailField[];
  className?: string;
}

/**
 * Generic component for rendering expanded row details in a Table
 * Displays key-value pairs with consistent styling
 */
export const ExpandedRowDetails: React.FC<ExpandedRowDetailsProps> = ({
  fields,
  className = '',
}) => (
  <div className={`py-2 border-t border-border ${className}`}>
    <div className="flex flex-col gap-2">
      {fields.map((field, index) => (
        <div key={index}>
          <Text variant="small-medium" className="inline text-foreground">
            {field.label}:{' '}
          </Text>
          <Text variant="small-medium" className="inline whitespace-pre-line text-muted-foreground">
            {field.value || field.defaultValue || '-'}
          </Text>
        </div>
      ))}
    </div>
  </div>
);
