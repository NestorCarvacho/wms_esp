import { useCallback, useEffect, useRef, useState } from 'react';
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
}

export function usePaginatedCrudTable<T>({
  fetchPage,
  onError,
  initialPageSize = DEFAULT_PAGE_SIZE,
  empresaFilterId,
}: UsePaginatedCrudTableOptions<T>) {
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(DEFAULT_PAGE);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(DEFAULT_PAGE);
  }, [empresaFilterId]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPageRef.current({
        pagina: page,
        porPagina: pageSize,
        buscar: debouncedSearch.trim() || undefined,
        ...(empresaFilterId != null ? { empresaId: empresaFilterId } : {}),
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      onErrorRef.current?.(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, empresaFilterId]);

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
