export function displayLabel(nombre?: string | null, id?: number | null): string {
  if (nombre) return nombre;
  if (id != null) return `#${id}`;
  return '—';
}

export function displayEmpresa(row: { empresa_nombre?: string | null; empresa_id?: number | null }): string {
  return displayLabel(row.empresa_nombre, row.empresa_id);
}

export function displayCargo(row: { cargo_nombre?: string | null; cargo_id?: number | null }): string {
  return displayLabel(row.cargo_nombre, row.cargo_id);
}

export function displayUnidadMedida(row: {
  unidad_medida_nombre?: string | null;
  unidad_medida_id?: number | null;
}): string {
  return displayLabel(row.unidad_medida_nombre, row.unidad_medida_id);
}

export function displayRol(row: { rol_nombre?: string | null; rol_id?: number | null }): string {
  return displayLabel(row.rol_nombre, row.rol_id);
}

export function displayBodega(row: { bodega_nombre?: string | null; bodega_id?: number | null }): string {
  return displayLabel(row.bodega_nombre, row.bodega_id);
}

export function displayTipoZona(row: { tipo_zona_nombre?: string | null; tipo_zona_id?: number | null }): string {
  return displayLabel(row.tipo_zona_nombre, row.tipo_zona_id);
}

export function displayTipoProducto(row: {
  tipo_producto_nombre?: string | null;
  tipo_producto_id?: number | null;
}): string {
  return displayLabel(row.tipo_producto_nombre, row.tipo_producto_id);
}

/** Etiqueta estándar para combos de empresa (búsqueda con texto completo). */
export function empresaComboBoxOption(empresa: {
  codigo: string;
  nombre: string;
  id?: number;
  esta_activa?: boolean;
}) {
  const suffix = empresa.esta_activa === false ? ' (Inhabilitada)' : '';
  const label = `${empresa.codigo} — ${empresa.nombre}${suffix}`;
  return {
    label,
    value: empresa.id != null ? String(empresa.id) : '',
    searchTokens: `${empresa.codigo} ${empresa.nombre} inhabilitada inactiva`,
  };
}
