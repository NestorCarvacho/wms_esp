import * as React from 'react';
import { LabelInput } from '@/components/ui/inputs/LabelInput';


export interface TableHeaderProps {
  searchable: boolean;
  searchValue: string;
  placeholder: string;
  onSearchChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Internal component for table search header
 * Maintains responsivity with max-width constraint
 */
export const TableHeader: React.FC<TableHeaderProps> = ({
  searchable,
  searchValue,
  placeholder,
  onSearchChange,
  disabled = false,
}) => {
  if (!searchable) return null;

  return (
    <div className="flex w-full justify-end px-4">
      <div style={{ width: 280 }}>
        <LabelInput
          placeholder={placeholder}
          value={searchValue}
          onChange={onSearchChange}
          type="search"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
