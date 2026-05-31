import * as React from 'react';
import { LabelInput } from '@/components/ui/inputs/LabelInput';
import { IconScout } from '../images/IconScout';
import { colors } from '@/assets/styles/colors';


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
          iconRight={<IconScout name="search" color={colors.primary.auxiliar} size="lg" />}
          type="search"
          variant="standard"
          size="sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
