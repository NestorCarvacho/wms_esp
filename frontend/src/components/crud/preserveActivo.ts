/** Preserva activo en PUT (soft delete vía eliminar, no editable en formulario). */
export function preserveActivoNumber(activo?: number | boolean | null): number {
  if (activo === true || activo === 1) return 1;
  if (activo === false || activo === 0) return 0;
  return 1;
}

export function preserveActivoBoolean(activo?: number | boolean | null): boolean {
  return activo === true || activo === 1;
}
