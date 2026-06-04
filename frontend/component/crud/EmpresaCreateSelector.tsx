import { ComboBox } from '@/components/ui/inputs/ComboBox';

interface EmpresaCreateSelectorProps {
  show: boolean;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; searchTokens?: string }[];
  loading?: boolean;
  id?: string;
  className?: string;
}

export function EmpresaCreateSelector({
  show,
  value,
  onChange,
  options,
  loading = false,
  id = 'empresaCreate',
  className,
}: EmpresaCreateSelectorProps) {
  if (!show) return null;

  return (
    <ComboBox
      id={id}
      label="Empresa"
      options={
        options.length
          ? options
          : [{ label: loading ? 'Cargando…' : 'Sin empresas', value: '' }]
      }
      value={value}
      onChange={(v) => onChange(String(v))}
      searchable
      required
      disabled={loading || options.length === 0}
      className={className ?? 'min-w-0'}
    />
  );
}
