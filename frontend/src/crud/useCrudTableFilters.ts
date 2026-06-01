import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type CrudTableFilterValues = Record<string, string>;

interface UseCrudTableFiltersOptions {
  /** Milisegundos de debounce para campos de texto (default 300). */
  debounceMs?: number;
  /** Claves que aplican debounce; el resto se aplica al instante (p. ej. selects). */
  debounceKeys?: readonly string[];
}

function shallowEqual(a: CrudTableFilterValues, b: CrudTableFilterValues): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

/**
 * Estado de filtros para listados CRUD.
 * Combínalo con `usePaginatedCrudTable` pasando `debouncedValues` como `filterValues`.
 */
export function useCrudTableFilters(
  initialValues: CrudTableFilterValues = {},
  options: UseCrudTableFiltersOptions = {},
) {
  const { debounceMs = 300, debounceKeys = [] } = options;
  const debounceKeysKey = debounceKeys.join('\0');
  const debounceKeySet = useMemo(() => new Set(debounceKeys), [debounceKeysKey]);

  const [values, setValues] = useState<CrudTableFilterValues>(initialValues);
  const [debouncedValues, setDebouncedValues] = useState<CrudTableFilterValues>(initialValues);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Campos sin debounce: se reflejan de inmediato en debouncedValues.
  useEffect(() => {
    const immediate: CrudTableFilterValues = {};
    for (const [key, value] of Object.entries(values)) {
      if (!debounceKeySet.has(key)) {
        immediate[key] = value;
      }
    }
    if (Object.keys(immediate).length === 0) return;

    setDebouncedValues((prev) => {
      const next = { ...prev, ...immediate };
      return shallowEqual(prev, next) ? prev : next;
    });
  }, [values, debounceKeysKey]);

  // Campos con debounce: actualización retardada.
  useEffect(() => {
    const delayedKeys = Object.keys(values).filter((key) => debounceKeySet.has(key));
    if (delayedKeys.length === 0) return;

    const timer = window.setTimeout(() => {
      setDebouncedValues((prev) => {
        const next = { ...prev };
        for (const key of delayedKeys) {
          next[key] = valuesRef.current[key] ?? '';
        }
        return shallowEqual(prev, next) ? prev : next;
      });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [values, debounceMs, debounceKeysKey]);

  const setFilter = useCallback((key: string, value: string) => {
    setValues((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setValues(initialValues);
    setDebouncedValues(initialValues);
  }, [initialValues]);

  const getNumber = useCallback(
    (key: string): number | undefined => {
      const raw = debouncedValues[key]?.trim();
      if (!raw) return undefined;
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    },
    [debouncedValues],
  );

  return {
    values,
    debouncedValues,
    setFilter,
    setValues,
    resetFilters,
    getNumber,
  };
}
