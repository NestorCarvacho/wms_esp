/** Elimina puntos y guión y normaliza a mayúsculas */
function clean(rut: string): string {
  return rut.replace(/[.\-\s]/g, '').toUpperCase();
}

/** Formatea RUT: "123456789" → "12.345.678-9" */
export function formatRut(raw: string): string {
  const cleaned = clean(raw);
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv   = cleaned.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

/** Valida el dígito verificador del RUT chileno */
export function validateRut(raw: string): boolean {
  const cleaned = clean(raw);
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const dvInput = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  const digits = body.split('').reverse().map(Number);
  const factors = [2, 3, 4, 5, 6, 7];
  const sum = digits.reduce((acc, d, i) => acc + d * factors[i % factors.length], 0);
  const remainder = 11 - (sum % 11);

  const dvComputed =
    remainder === 11 ? '0' :
    remainder === 10 ? 'K' :
    String(remainder);

  return dvInput === dvComputed;
}

/** Devuelve mensaje de error o null si es válido (acepta vacío como válido) */
export function rutError(raw: string): string | null {
  if (!raw.trim()) return null;
  const cleaned = clean(raw);
  if (cleaned.length < 7) return 'RUT demasiado corto';
  if (!validateRut(raw)) return 'RUT inválido (dígito verificador incorrecto)';
  return null;
}
