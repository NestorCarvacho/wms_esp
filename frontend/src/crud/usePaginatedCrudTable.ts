import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PaginatedListParams } from '@/api/listQuery';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/api/listQuery';
import type { TablePagination } from '@/components/ui/tables';

interface PaginatedFetchResult<T> {
  total: number;
  items: T[];
}

interface UsePaginatedCrudTableOptions<T> {
  fetchPage: (params: PaginatedListParams) => Promise<PaginatedFetchResult<T>>;
  onError?: (err: unknown) => void;
  initialPageSize?: number;
  /** Al cambiar, reinicia a la página 1 y recarga (p. ej. filtro de empresa). */
  empresaFilterId?: number;
  /** Valores de filtros adicionales (debounced si vienen de useCrudTableFilters). */
  filterValues?: Record<string, string | number | undefined>;
  /** Mapea filterValues a query params del API. */
  mapFiltersToParams?: (
    filters: Record<string, string | number | undefined>,
  ) => PaginatedListParams['extra'];
}

function serializeFilterValues(
  filterValues: Record<string, string | number | undefined> | undefined,
): string {
  if (!filterValues) return '';
  return JSON.stringify(filterValues);
}

export function usePaginatedCrudTable<T>({
  fetchPage,
  onError,
  initialPageSize = DEFAULT_PAGE_SIZE,
  empresaFilterId,
  filterValues,
  mapFiltersToParams,
}: UsePaginatedCrudTableOptions<T>) {
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const filterValuesRef = useRef(filterValues);
  filterValuesRef.current = filterValues;
  const mapFiltersToParamsRef = useRef(mapFiltersToParams);
  mapFiltersToParamsRef.current = mapFiltersToParams;

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const filterValuesKey = useMemo(
    () => serializeFilterValues(filterValues),
    [filterValues],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(DEFAULT_PAGE);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(DEFAULT_PAGE);
  }, [empresaFilterId, filterValuesKey]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const fv = filterValuesRef.current;
      const mapper = mapFiltersToParamsRef.current;
      const extraParams = fv && mapper ? mapper(fv) : undefined;

      const extraBuscar =
        extraParams?.buscar != null ? String(extraParams.buscar).trim() : '';
      const mergedBuscar = debouncedSearch.trim() || extraBuscar || undefined;
      const { buscar: _ignored, ...restExtra } = extraParams ?? {};

      const result = await fetchPageRef.current({
        pagina: page,
        porPagina: pageSize,
        buscar: mergedBuscar,
        ...(empresaFilterId != null ? { empresaId: empresaFilterId } : {}),
        ...(restExtra && Object.keys(restExtra).length > 0 ? { extra: restExtra } : {}),
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      onErrorRef.current?.(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, empresaFilterId, filterValuesKey]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(DEFAULT_PAGE);
  }, []);

  const pagination: TablePagination = {
    page,
    pageSize,
    total,
    onChange: setPage,
    onPageSizeChange: handlePageSizeChange,
  };

  return {
    items,
    total,
    loading,
    reload,
    pagination,
    handleSearch: setSearch,
  };
}
