import { useEffect } from 'react';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { useGeografia } from '@/hooks/useGeografia';

interface DireccionValue {
  direccion?: string | null;
  region_id?: number | null;
  ciudad_id?: number | null;
  comuna_id?: number | null;
}

interface DireccionSelectorProps {
  value: DireccionValue;
  onChange: (val: DireccionValue) => void;
  disabled?: boolean;
}

export function DireccionSelector({ value, onChange, disabled }: DireccionSelectorProps) {
  const { regiones, ciudades, comunas, loadingRegiones, onRegionChange, onCiudadChange } =
    useGeografia(value.region_id, value.ciudad_id);

  useEffect(() => {
    if (value.region_id) void onRegionChange(value.region_id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (value.ciudad_id) void onCiudadChange(value.ciudad_id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regionOptions = regiones.map((r) => ({ value: String(r.id), label: r.nombre }));
  const ciudadOptions = ciudades.map((c) => ({ value: String(c.id), label: c.nombre }));
  const comunaOptions = comunas.map((c) => ({ value: String(c.id), label: c.nombre }));

  const handleRegion = async (v: string | string[]) => {
    const id = v ? Number(v) : null;
    onChange({ ...value, region_id: id, ciudad_id: null, comuna_id: null });
    if (id) await onRegionChange(id);
  };

  const handleCiudad = async (v: string | string[]) => {
    const id = v ? Number(v) : null;
    onChange({ ...value, ciudad_id: id, comuna_id: null });
    if (id) await onCiudadChange(id);
  };

  const handleComuna = (v: string | string[]) => {
    onChange({ ...value, comuna_id: v ? Number(v) : null });
  };

  return (
    <div className="space-y-3">
      <LabelInput
        id="direccion-calle"
        label="Dirección (calle y número)"
        placeholder="Ej: Av. Apoquindo 4500"
        value={value.direccion ?? ''}
        onChange={(v) => onChange({ ...value, direccion: v || null })}
        disabled={disabled}
      />

      <div className="grid grid-cols-1 gap-3">
        <ComboBox
          id="region"
          label="Región"
          options={regionOptions}
          value={value.region_id ? String(value.region_id) : ''}
          onChange={handleRegion}
          disabled={disabled || loadingRegiones}
          placeholder="Seleccionar región"
          searchable
        />

        <ComboBox
          id="ciudad"
          label="Ciudad"
          options={ciudadOptions}
          value={value.ciudad_id ? String(value.ciudad_id) : ''}
          onChange={handleCiudad}
          disabled={disabled || !value.region_id}
          placeholder="Seleccionar ciudad"
          searchable
        />

        <ComboBox
          id="comuna"
          label="Comuna"
          options={comunaOptions}
          value={value.comuna_id ? String(value.comuna_id) : ''}
          onChange={handleComuna}
          disabled={disabled || !value.ciudad_id}
          placeholder="Seleccionar comuna"
          searchable
        />
      </div>
    </div>
  );
}
