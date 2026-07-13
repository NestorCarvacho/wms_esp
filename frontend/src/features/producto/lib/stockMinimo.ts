export type StockMinimoInputResult =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

/** Valida y parsea el umbral desde el formulario (vacío = sin umbral). */
export function readStockMinimoInput(value: string): StockMinimoInputResult {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { ok: false, error: 'Ingrese un número válido para el stock mínimo' };
  }
  if (parsed < 0) {
    return { ok: false, error: 'El stock mínimo no puede ser negativo' };
  }
  return { ok: true, value: parsed };
}

/** Parsea umbral de stock mínimo desde input de formulario (vacío = sin umbral). */
export function parseStockMinimo(value: string): number | null {
  const result = readStockMinimoInput(value);
  return result.ok ? result.value : null;
}

export function formatStockMinimo(value: number | null | undefined): string {
  return value != null ? String(value) : '';
}
