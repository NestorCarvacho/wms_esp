import { ComboBox } from '@/components/ui/inputs/ComboBox';

interface EmpresaMaestraFilterProps {
  show: boolean;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  loading?: boolean;
  className?: string;
}

export function EmpresaMaestraFilter({
  show,
  value,
  onChange,
  options,
  loading = false,
  className = 'mb-4 max-w-md',
}: EmpresaMaestraFilterProps) {
  if (!show) return null;

  return (
    <ComboBox
      id="empresaFilter"
      label="Empresa"
      options={options}
      value={value}
      onChange={(v) => onChange(String(v))}
      searchable
      disabled={loading || options.length <= 1}
      className={className}
    />
  );
}
