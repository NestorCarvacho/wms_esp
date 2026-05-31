import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRut } from '@/utils';
import { ROUTE_DEFINITIONS } from '@/routes';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';
import type { TableColumn, TableAction } from '@/components/ui/tables/Table';
import { companyService, type Company } from '@/api/domains/company';
import { useUI } from '@/hooks/ui/useUI';
import { useTableSearch } from '@/hooks/ui/table/useTableSearch';


interface UseCompanyListResult {
  rows: Company[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  columns: TableColumn<Company>[];
  actions: TableAction<Company>[];
  onSearch: (term: string) => void;
  onSortChange: (columnKey: string, direction: 'asc' | 'desc') => void;
  loading: boolean;
}

export function useCompanyList(): UseCompanyListResult {
  const { showNotification } = useUI();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { debouncedSearchText, setSearchText } = useTableSearch({
    onDebouncedChange: () => setPage(1),
  });
  const [sort, setSort] = useState<{
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
  }>({ orderBy: 'companyName', direction: 'ASC' });
  const latestRequestIdRef = useRef(0);

  // orderBy map for server sort
  const orderByMap: Record<string, string> = useMemo(
    () => ({
      id: 'companyId',
      name: 'companyName',
      rut: 'companyRUT',
      type: 'companyType',
      syncWithRex: 'syncWithRex',
    }),
    [],
  );

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const requestId = ++latestRequestIdRef.current;

    const response = await companyService.list({
      page,
      pageSize,
      searchText: debouncedSearchText || undefined,
      sort:
        sort.orderBy && sort.direction
          ? {
            key: sort.orderBy,
            direction: sort.direction.toLowerCase() as 'asc' | 'desc',
          }
          : undefined,
    });

    // Avoid race conditions
    if (requestId !== latestRequestIdRef.current) {
      return;
    }

    if (!response.success || !response.data) {
      showNotification(
        'error',
        response.error?.description || 'No se pudo obtener empresas',
        5000,
      );
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    // Deduplicate by id
    const seen = new Set<number>();
    const data = response.data.data.filter((company) => {
      if (seen.has(company.id)) return false;
      seen.add(company.id);
      return true;
    });

    setRows(data);
    setTotal(response.data.totalRecords);
    setLoading(false);
  }, [
    page,
    pageSize,
    debouncedSearchText,
    sort.orderBy,
    sort.direction,
    showNotification,
  ]);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  const columns: TableColumn<Company>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        sortable: true,
        render: (row: Company) => row.id,
      },
      {
        key: 'rut',
        header: 'RUT',
        sortable: true,
        render: (row: Company) => formatRut(row.rut),
      },
      {
        key: 'name',
        header: 'Razón Social',
        sortable: true,
        maxWidth: 250,
        render: (row: Company) => (
          <Text
            variant="subheader-medium"
            color={colors.important.main}
            as="span"
            onClick={() => {
              void navigate(ROUTE_DEFINITIONS.EMPRESAS_PERFIL.path.replace(':companyId', String(row.id)));
            }}
            className="cursor-pointer transition-colors hover:opacity-80"
          >
            {row.name}
          </Text>
        ),
      },
      {
        key: 'syncWithRex',
        header: 'Sincroniza con Rex+',
        sortable: true,
        render: (row: Company) => (
          <Text variant="body-regular">{row.syncWithRex ? 'Sí' : 'No'}</Text>
        ),
      },
      {
        key: 'type',
        header: 'Tipo',
        sortable: true,
        render: (row: Company) => row.type,
      },
    ],
    [navigate],
  );

  const onSearch = useCallback((term: string) => {
    setSearchText(term);
  }, [setSearchText]);

  const onSortChange = useCallback(
    (columnKey: string, direction: 'asc' | 'desc') => {
      const backendKey = orderByMap[columnKey];
      setSort({
        orderBy: backendKey,
        direction: direction.toUpperCase() as 'ASC' | 'DESC',
      });
      setPage(1);
    },
    [orderByMap],
  );

  const actions: TableAction<Company>[] = useMemo(
    () => [
      {
        id: 'edit',
        label: 'Editar',
        icon: 'edit',
        onClick: (row) => {
          void navigate(ROUTE_DEFINITIONS.EMPRESAS_PERFIL.path.replace(':companyId', String(row.id)));
        },
        color: colors.important.main,
      },
    ],
    [navigate],
  );

  const setPageSizeSafe = useCallback((size: number) => {
    const normalized = Number(size) || 10;
    setPageSize(normalized);
    setPage(1);
  }, []);

  // Safety: adjust page if it exceeds total pages
  useEffect(() => {
    if (total > 0) {
      const totalPages = Math.ceil(total / pageSize);
      if (page > totalPages) {
        setPage(1);
      }
    }
  }, [total, page, pageSize]);

  return {
    rows,
    total,
    page,
    pageSize,
    setPage,
    setPageSize: setPageSizeSafe,
    columns,
    actions,
    onSearch,
    onSortChange,
    loading,
  };
}

export default useCompanyList;
