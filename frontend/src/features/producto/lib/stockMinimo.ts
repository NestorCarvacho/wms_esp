/** Parsea umbral de stock mínimo desde input de formulario (vacío = sin umbral). */
export function parseStockMinimo(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function formatStockMinimo(value: number | null | undefined): string {
  return value != null ? String(value) : '';
}
