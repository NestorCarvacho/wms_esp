import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatRut, toCapitalCase } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';
import { ROUTE_DEFINITIONS } from '@/routes';
import type { TableColumn, TableAction } from '@/components/ui/tables/Table';
import type { SimpleFilter } from '@/components/ui/filters/FilterDropdown';
import { employeeService, type Employee, type HoldingCompany } from '@/api/domains/employee';
import { useUI } from '@/hooks/ui/useUI';
import { useTableSearch } from '@/hooks/ui/table/useTableSearch';
import { useEmployeeExport } from '@/hooks/employee/useEmployeeExport';

// Filters state
interface EmployeeFiltersState {
  companyIds: string[];
  statusFilter: 'ALL' | 'V' | 'NV';
}

interface UseEmployeeListResult {
  rows: Employee[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;
  filters: EmployeeFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<EmployeeFiltersState>>;
  filterConfig: SimpleFilter[];
  columns: TableColumn<Employee>[];
  actions: TableAction<Employee>[];
  onSearch: (term: string) => void;
  onSortChange: (columnKey: string, direction: 'asc' | 'desc') => void;
  loading: boolean;
  togglingIds: Set<number>;
  toggleEmployeeStatus: (row: Employee) => Promise<void>;
  openExportModal: () => void;
}
export function useEmployeeList(): UseEmployeeListResult {
  const { showNotification, openModal } = useUI();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { debouncedSearchText, setSearchText } = useTableSearch({
    onDebouncedChange: () => setPage(1),
  });
  // Default initial sort: by fullName ascending so first request already sorted by name
  const [sort, setSort] = useState<{
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
  }>({ orderBy: 'fullName', direction: 'ASC' });
  const [companies, setCompanies] = useState<HoldingCompany[]>([]);
  const [filters, internalSetFilters] = useState<EmployeeFiltersState>({
    companyIds: [],
    statusFilter: 'ALL',
  });
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  // Track latest request to avoid race conditions overriding newer data
  const latestRequestIdRef = useRef(0);

  // Setter wrapper: whenever filters change, reset pagination to defaults
  const setFilters = useCallback((
    updater: React.SetStateAction<EmployeeFiltersState>,
  ) => {
    internalSetFilters((previous) => {
      const next = typeof updater === 'function'
        ? (updater as (parameter: EmployeeFiltersState) => EmployeeFiltersState)(previous)
        : updater;
      // Only reset if there's an actual change
      if (next !== previous) {
        setPage(1);
        setPageSize(10);
      }
      return next;
    });
  }, []);

  // Load holding companies once
  useEffect(() => {
    (async () => {
      const response = await employeeService.listHoldingCompanies();
      if (!response.success || !response.data) {
        showNotification('error', 'No se pudieron obtener empresas', 5000);
        return;
      }
      setCompanies(response.data);
    })().catch(() => {
      showNotification('error', 'Error inesperado obteniendo empresas', 5000);
    });
  }, [showNotification]);

  const companyOptions: SimpleFilter['options'] = useMemo(() => (
    companies.map((company) => ({ value: String(company.id), label: company.name }))
  ), [companies]);

  const statusOptions: SimpleFilter['options'] = useMemo(() => ([
    { value: 'ALL', label: 'Ambos' },
    { value: 'V', label: 'Vigente' },
    { value: 'NV', label: 'No vigente' },
  ]), []);

  const filterConfig: SimpleFilter[] = useMemo(() => ([
    { key: 'companyIds', label: 'Empresas', multiple: true, options: companyOptions, placeholder: 'Seleccionar empresas' },
    { key: 'statusFilter', label: 'Estado', multiple: false, options: statusOptions, defaultValue: 'ALL', placeholder: 'Estado' },
  ]), [companyOptions, statusOptions]);

  // orderBy map for server sort
  const orderByMap: Record<string, string> = useMemo(() => ({
    rut: 'rut',
    fullName: 'fullName',
    company: 'companyName',
    contract: 'contractNumber',
  }), []);

  const fetchEmployees = useCallback(async () => {
    if (companies.length === 0) return; // wait for companies to load
    setLoading(true);
    const requestId = ++latestRequestIdRef.current;
    // If no companies selected, send all available companies
    const effectiveCompanyIds = filters.companyIds.length === 0
      ? companies.map((company) => String(company.id))
      : filters.companyIds;
    const response = await employeeService.list({
      page,
      pageSize,
      companyIds: effectiveCompanyIds,
      statusFilter: filters.statusFilter,
      searchText: debouncedSearchText || undefined,
      sort: sort.orderBy && sort.direction ? { key: sort.orderBy, direction: sort.direction.toLowerCase() as 'asc' | 'desc' } : undefined,
    });
    // If a newer request was fired, discard this result
    if (requestId !== latestRequestIdRef.current) {
      return;
    }
    if (!response.success || !response.data) {
      showNotification(
        'error',
        response.error?.description || 'No se pudo obtener colaboradores',
        5000,
      );
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    // Deduplicate by id in case backend (or race) yields duplicates
    const seen = new Set<number>();
    const data = response.data.data.filter((employee) => {
      if (seen.has(employee.id)) return false;
      seen.add(employee.id);
      return true;
    });
    setRows(data);
    setTotal(response.data.totalRecords);
    setLoading(false);
  }, [
    companies,
    filters.companyIds,
    filters.statusFilter,
    page,
    pageSize,
    debouncedSearchText,
    sort.orderBy,
    sort.direction,
    showNotification,
  ]);

  useEffect(() => { void fetchEmployees(); }, [fetchEmployees]);

  const toggleEmployeeStatus = useCallback(async (row: Employee) => {
    const enabling = row.status === 'inactive';
    // optimistic update
    setTogglingIds((previous) => new Set(previous).add(row.id));
    setRows((previous) => previous.map((record) => (
      record.id === row.id
        ? { ...record, status: enabling ? 'active' : 'inactive' }
        : record
    )));
    const response = await employeeService.enableDisable({
      employeeId: row.id,
      enable: enabling,
      companyId: Number(filters.companyIds[0]),
    });
    if (!response.success) {
      // rollback
      setRows((previous) => previous.map((record) => (
        record.id === row.id ? { ...record, status: row.status } : record
      )));
      showNotification('error', 'No se pudo actualizar estado', 5000);
    } else {
      showNotification('success', `Colaborador ${enabling ? 'habilitado' : 'deshabilitado'}`, 4000);
      // Re-sync with backend to avoid drift / duplicates
      void fetchEmployees();
    }
    setTogglingIds(prev => { const next = new Set(prev); next.delete(row.id); return next; });
  }, [filters.companyIds, showNotification, fetchEmployees]);

  const columns: TableColumn<Employee>[] = useMemo(() => [
    { key: 'contract', header: 'Contrato', sortable: true, render: (row: Employee) => row.contractNumber },
    { key: 'rut', header: 'RUT', sortable: true, render: (row: Employee) => formatRut(row.rut) },
    { key: 'fullName', header: 'Nombre', sortable: true, maxWidth: 350, render: (row: Employee) => (
      <Text
        variant="subheader-medium"
        color={colors.important.main}
        as="span"
        onClick={() => { void navigate(ROUTE_DEFINITIONS.EMPLEADOS_PERFIL.path.replace(':employeeId', String(row.id))); }}
        className="cursor-pointer transition-colors hover:opacity-80"
      >
        {toCapitalCase(row.fullName)}
      </Text>
    ) },
    { key: 'status', header: 'Estado', render: (row: Employee) => (
      <Text variant="subheader-regular" as="span">
        {row.status === 'active' ? 'Vigente' : 'No vigente'}
      </Text>
    ) },

    { key: 'company', header: 'Empresa', sortable: true, render: (row: Employee) => row.companyName },
  ], [navigate]);

  const actions: TableAction<Employee>[] = useMemo(() => [
    {
      id: 'contracts',
      label: 'Contratos',
      icon: 'folderOpen',
      onClick: (row) => {
        void navigate(`${ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS.path}?employeeId=${row.id}`);
      },
      color: colors.important.main,
    },
    {
      id: 'enable',
      label: 'Habilitar',
      icon: 'check',
      onClick: (row) => { void toggleEmployeeStatus(row); },
      color: colors.feedback.success400,
      disabled: (row) => togglingIds.has(row.id),
      hidden: (row) => row.status === 'active',
    },
    {
      id: 'disable',
      label: 'Deshabilitar',
      icon: 'close',
      onClick: (row) => { void toggleEmployeeStatus(row); },
      color: colors.feedback.error400,
      disabled: (row) => togglingIds.has(row.id),
      hidden: (row) => row.status === 'inactive',
    },
  ], [navigate, toggleEmployeeStatus, togglingIds]);

  const onSearch = useCallback((term: string) => {
    setSearchText(term);
  }, [setSearchText]);

  const onSortChange = useCallback((columnKey: string, direction: 'asc' | 'desc') => {
    const backendKey = orderByMap[columnKey];
    setSort({
      orderBy: backendKey,
      direction: direction.toUpperCase() as 'ASC' | 'DESC',
    });
    setPage(1);
  }, [orderByMap]);

  const setPageSizeSafe = useCallback((size: number) => {
    const normalized = Number(size) || 10;
    setPageSize(normalized);
    setPage(1);
  }, []);

  // Safety: if current page becomes greater than total pages after new data, adjust back
  useEffect(() => {
    if (total > 0) {
      const totalPages = Math.ceil(total / pageSize);
      if (page > totalPages) {
        setPage(1); // simpler: go back to first page to avoid empty holes
      }
    }
  }, [total, page, pageSize]);

  // Export functionality
  const { exportEmployees } = useEmployeeExport({
    searchText: debouncedSearchText || undefined,
    statusFilter: filters.statusFilter,
  });

  const openExportModal = useCallback(() => {
    openModal('ExportModal', {
      onExport: exportEmployees,
      availableFormats: ['EXCEL'],
    });
  }, [openModal, exportEmployees]);

  return {
    rows,
    total,
    page,
    pageSize,
    setPage,
    setPageSize: setPageSizeSafe,
    filters,
    setFilters,
    filterConfig,
    columns,
    actions,
    onSearch,
    onSortChange,
    loading,
    togglingIds,
    toggleEmployeeStatus,
    openExportModal,
  };
}

export default useEmployeeList;