import { useState, useEffect, useRef } from 'react';


export interface UseTableSearchOptions {
  /**
   * Tiempo de delay para el debounce en milisegundos
   * @default 500
   */
  delay?: number;
  /**
   * Callback que se ejecuta cuando el valor debounced cambia
   * Útil para resetear paginación, etc.
   */
  onDebouncedChange?: (debouncedText: string) => void;
}

export interface UseTableSearchReturn {
  /**
   * Valor actual del input de búsqueda (sin debounce)
   */
  searchText: string;
  /**
   * Valor con debounce aplicado, usar este para queries al servidor
   */
  debouncedSearchText: string;
  /**
   * Función para actualizar el texto de búsqueda
   */
  setSearchText: (text: string) => void;
}

/**
 * Hook para gestionar búsqueda en tablas con debounce
 * Parte del sistema modular de hooks de tabla junto a useTableSort, useTableSelection
 * 
 * @example
 * ```typescript
 * const { debouncedSearchText, setSearchText } = useTableSearch({
 *   onDebouncedChange: () => setPage(1), // resetear paginación
 * });
 * 
 * // En el callback de Table
 * const onSearch = useCallback((text: string) => {
 *   setSearchText(text);
 * }, [setSearchText]);
 * 
 * // Usar debouncedSearchText en el fetch
 * const fetchData = useCallback(async () => {
 *   const response = await api.search({ query: debouncedSearchText });
 * }, [debouncedSearchText]);
 * ```
 */
export function useTableSearch(
  options: UseTableSearchOptions = {},
): UseTableSearchReturn {
  const { delay = 500, onDebouncedChange } = options;
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Estabilizar la referencia del callback para evitar re-renders innecesarios
  const onDebouncedChangeRef = useRef(onDebouncedChange);
  
  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  // Implementación inline del debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText, delay]);

  // Notificar cuando el valor debounced cambia
  useEffect(() => {
    if (onDebouncedChangeRef.current) {
      onDebouncedChangeRef.current(debouncedSearchText);
    }
  }, [debouncedSearchText]);

  return {
    searchText,
    debouncedSearchText,
    setSearchText,
  };
}

export default useTableSearch;
