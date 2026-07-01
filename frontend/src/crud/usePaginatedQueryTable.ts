import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginatedListParams, SortDirection } from '@/api/listQuery';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/api/listQuery';
import type { TablePagination } from '@/components/ui/tables';

interface PaginatedFetchResult<T> {
  total: number;
  items: T[];
}

interface UsePaginatedQueryTableOptions<T> {
  queryKeyBuilder: (params: PaginatedListParams) => readonly unknown[];
  fetchPage: (params: PaginatedListParams) => Promise<PaginatedFetchResult<T>>;
  onError?: (err: unknown) => void;
  initialPageSize?: number;
  empresaFilterId?: number;
  filterValues?: Record<string, string | number | undefined>;
  mapFiltersToParams?: (
    filters: Record<string, string | number | undefined>,
  ) => PaginatedListParams['extra'];
  enabled?: boolean;
}

function serializeFilterValues(
  filterValues: Record<string, string | number | undefined> | undefined,
): string {
  if (!filterValues) return '';
  return JSON.stringify(filterValues);
}

export function usePaginatedQueryTable<T>({
  queryKeyBuilder,
  fetchPage,
  onError,
  initialPageSize = DEFAULT_PAGE_SIZE,
  empresaFilterId,
  filterValues,
  mapFiltersToParams,
  enabled = true,
}: UsePaginatedQueryTableOptions<T>) {
  const queryClient = useQueryClient();
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
  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filterValuesKey = useMemo(
    () => serializeFilterValues(filterValues),
    [filterValues],
  );

  const listParams = useMemo((): PaginatedListParams => {
    const fv = filterValues;
    const mapper = mapFiltersToParams;
    const extraParams = fv && mapper ? mapper(fv) : undefined;
    const extraBuscar =
      extraParams?.buscar != null ? String(extraParams.buscar).trim() : '';
    const mergedBuscar = debouncedSearch.trim() || extraBuscar || undefined;
    const { buscar: _ignored, ...restExtra } = extraParams ?? {};
    return {
      pagina: page,
      porPagina: pageSize,
      buscar: mergedBuscar,
      ...(empresaFilterId != null ? { empresaId: empresaFilterId } : {}),
      ...(sortKey ? { ordenarPor: sortKey, orden: sortDirection } : {}),
      ...(restExtra && Object.keys(restExtra).length > 0 ? { extra: restExtra } : {}),
    };
  }, [
    page,
    pageSize,
    debouncedSearch,
    empresaFilterId,
    filterValuesKey,
    sortKey,
    sortDirection,
    filterValues,
    mapFiltersToParams,
  ]);

  const query = useQuery({
    queryKey: queryKeyBuilder(listParams),
    queryFn: () => fetchPageRef.current(listParams),
    enabled,
  });

  useEffect(() => {
    if (query.isError) {
      onErrorRef.current?.(query.error);
    }
  }, [query.isError, query.error]);

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

  const handleSortChange = useCallback((key: string, direction: SortDirection) => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(DEFAULT_PAGE);
  }, []);

  const reload = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeyBuilder(listParams).slice(0, -1) });
  }, [queryClient, queryKeyBuilder, listParams]);

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(DEFAULT_PAGE);
  }, []);

  const pagination: TablePagination = {
    page,
    pageSize,
    total: query.data?.total ?? 0,
    onChange: setPage,
    onPageSizeChange: handlePageSizeChange,
  };

  const sortProps = {
    serverSideSort: true,
    onSortChange: handleSortChange,
  } as const;

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading || query.isFetching,
    reload,
    invalidate,
    pagination,
    handleSearch: setSearch,
    sortProps,
    sortKey,
    sortDirection,
  };
}
