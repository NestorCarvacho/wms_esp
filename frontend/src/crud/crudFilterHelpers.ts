export const MSG_SELECCIONE_EMPRESA = 'Seleccione una empresa';

/** Opciones de combo dependiente de empresa (deshabilitado hasta elegir empresa). */
export function dependentSelectOptions(
  puedeFiltrar: boolean,
  items: { label: string; value: string }[],
  options?: { placeholder?: string; allLabel?: string },
) {
  if (!puedeFiltrar) {
    return [{ label: options?.placeholder ?? MSG_SELECCIONE_EMPRESA, value: '' }];
  }
  return [{ label: options?.allLabel ?? 'Todos', value: '' }, ...items];
}
