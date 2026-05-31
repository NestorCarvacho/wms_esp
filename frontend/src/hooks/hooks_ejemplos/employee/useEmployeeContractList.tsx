import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors } from '@/assets/styles/colors';
import { Text } from '@/components/ui/text/Text';
import type { TableColumn, TableAction } from '@/components/ui/tables/Table';
import { employeeContractService, type EmployeeContract } from '@/api/domains/employeeContract';
import { useUI } from '@/hooks/ui/useUI';
import { useTableSearch } from '@/hooks/ui/table/useTableSearch';
import { useTranslation } from '@/i18n';
import { useAppSelector } from '@/hooks';
import { toCapitalCase } from '@/utils';
import { ROUTE_DEFINITIONS } from '@/routes';

// Datos de prueba para el filtro de empleados (temporal)
const MOCK_EMPLOYEES = [
  { value: '343580', label: 'Ariel Antunez' },
  { value: '2', label: 'María González - 98.765.432-1' },
  { value: '3', label: 'Pedro Ramírez - 11.222.333-4' },
  { value: '4', label: 'Ana Martínez - 55.666.777-8' },
  { value: '5', label: 'Carlos Soto - 33.444.555-6' },
];

interface UseEmployeeContractListResult {
  rows: EmployeeContract[];
  total: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  columns: TableColumn<EmployeeContract>[];
  actions: TableAction<EmployeeContract>[];
  onSearch: (term: string) => void;
  onSortChange: (columnKey: string, direction: 'asc' | 'desc') => void;
  loading: boolean;
  selectedEmployeeId: string;
  selectedEmployeeLabel: string;
  handleEmployeeChange: (key: string, value: string | string[]) => void;
  createContractUrl: string;
  dynamicTitle: string | undefined;
  employeeFilterConfig: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    placeholder: string;
    defaultValue: string;
  }>;
}

export function useEmployeeContractList(): UseEmployeeContractListResult {
  const { showNotification, openModal, closeModal } = useUI();
  const navigate = useNavigate();
  const { t: translate } = useTranslation();
  const syncAssistance = useAppSelector((state) => state.auth.user?.syncAssistance ?? false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Gestión de empleado seleccionado
  const employeeIdParam = searchParams.get('employeeId');
  const defaultEmployeeId = MOCK_EMPLOYEES[0]?.value || '';
  const defaultEmployeeLabel = MOCK_EMPLOYEES[0]?.label || '';
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    employeeIdParam || defaultEmployeeId,
  );
  const [selectedEmployeeLabel, setSelectedEmployeeLabel] = useState<string>(
    employeeIdParam 
      ? MOCK_EMPLOYEES.find(emp => emp.value === employeeIdParam)?.label || ''
      : defaultEmployeeLabel,
  );

  // Estado de tabla
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<EmployeeContract[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { debouncedSearchText, setSearchText } = useTableSearch({
    onDebouncedChange: () => setPage(1),
  });
  const [sort, setSort] = useState<{
    orderBy?: string;
    direction?: 'ASC' | 'DESC';
  }>({ orderBy: 'contractNumberREX', direction: 'ASC' });
  const latestRequestIdRef = useRef(0);

  // Sincronizar estado local con query params cuando cambian
  useEffect(() => {
    if (employeeIdParam && employeeIdParam !== selectedEmployeeId) {
      setSelectedEmployeeId(employeeIdParam);
      const employee = MOCK_EMPLOYEES.find(emp => emp.value === employeeIdParam);
      if (employee) {
        setSelectedEmployeeLabel(employee.label);
      }
    } else if (!employeeIdParam && selectedEmployeeId === defaultEmployeeId) {
      // Establecer el query param si no existe pero tenemos el empleado por defecto
      setSearchParams({ employeeId: defaultEmployeeId }, { replace: true });
    }
  }, [employeeIdParam, selectedEmployeeId, defaultEmployeeId, setSearchParams]);

  const handleEmployeeChange = useCallback((_key: string, value: string | string[]) => {
    const employeeId = Array.isArray(value) ? value[0] : value;
    setSelectedEmployeeId(employeeId);
    
    const employee = MOCK_EMPLOYEES.find(emp => emp.value === employeeId);
    setSelectedEmployeeLabel(employee?.label || '');
    
    if (employeeId) {
      setSearchParams({ employeeId });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]);

  // orderBy map for server sort - maps UI column keys to API field names
  const orderByMap: Record<string, string> = useMemo(
    () => ({
      contractNumber: 'contractNumberREX',
      contractName: 'contractNameREX',
      status: 'contractStatus',
      startDate: 'contractStartDate',
      endDate: 'contractEndDate',
      companyName: 'companyName',
      contractType: 'contractType',
    }),
    [],
  );

  const fetchContracts = useCallback(async () => {
    // No llamar API si no hay employeeId seleccionado
    if (!selectedEmployeeId) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++latestRequestIdRef.current;

    const response = await employeeContractService.list({
      employeeId: Number(selectedEmployeeId),
      page,
      pageSize,
      searchText: debouncedSearchText || undefined,
      sort: sort.orderBy && sort.direction
        ? { key: sort.orderBy, direction: sort.direction.toLowerCase() as 'asc' | 'desc' }
        : undefined,
    });

    // If a newer request was fired, discard this result
    if (requestId !== latestRequestIdRef.current) {
      return;
    }

    if (!response.success || !response.data) {
      showNotification(
        'error',
        response.error?.description || translate('employee:contracts.messages.loading'),
        5000,
      );
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setRows(response.data.data);
    setTotal(response.data.totalRecords);
    setLoading(false);
  }, [
    selectedEmployeeId,
    page,
    pageSize,
    debouncedSearchText,
    sort.orderBy,
    sort.direction,
    showNotification,
    translate,
  ]);

  useEffect(() => {
    void fetchContracts();
  }, [fetchContracts]);

  const handleDelete = useCallback(
    (row: EmployeeContract) => {
      const modalId = `delete-contract-${row.contractId}`;
      
      const confirmDelete = async () => {
        setLoading(true);
        
        const response = await employeeContractService.delete({
          employeeId: Number(selectedEmployeeId),
          contractId: row.contractId,
          contractNumberREX: row.contractNumber,
        });
        
        if (response.success) {
          showNotification('success', translate('employee:contracts.messages.deleteSuccess'), 5000);
          // Reload contracts list
          await fetchContracts();
        } else {
          const errorMessage = response.error?.detail 
            || response.error?.description 
            || translate('employee:contracts.messages.deleteFailed');
          showNotification('error', errorMessage, 5000);
        }
        
        setLoading(false);
      };
      
      openModal(
        'ConfirmModal',
        {
          modalId,
          variant: 'error',
          icon: 'alert',
          title: translate('employee:contracts.messages.deleteTitle'),
          bannerText: translate('employee:contracts.messages.deleteMessage', { 
            number: row.contractNumber, 
            name: row.contractName,
          }),
          bodyText: translate('employee:contracts.messages.deleteWarning'),
          onConfirm: confirmDelete,
          onClose: () => closeModal(modalId),
        },
        true,
      );
    },
    [
      selectedEmployeeId,
      translate,
      fetchContracts,
      openModal,
      closeModal,
      showNotification,
    ],
  );

  const columns: TableColumn<EmployeeContract>[] = useMemo(
    () => [
      {
        key: 'contractNumber',
        header: translate('employee:contracts.fields.number'),
        sortable: true,
        render: (row: EmployeeContract) => row.contractNumber,
      },
      {
        key: 'contractName',
        header: translate('employee:contracts.fields.name'),
        sortable: true,
        maxWidth: 200,
        render: (row: EmployeeContract) => (
          <Text
            variant="subheader-medium"
            color={colors.important.main}
            as="span"
            onClick={() => {
              if (selectedEmployeeId) {
                const url = ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS_EDITAR.path
                  .replace(':employeeId', selectedEmployeeId)
                  .replace(':contractId', String(row.contractId));
                void navigate(url);
              }
            }}
            className="cursor-pointer transition-colors hover:opacity-80"
          >
            {row.contractName}
          </Text>
        ),
      },
      {
        key: 'status',
        header: translate('employee:contracts.fields.status'),
        render: (row: EmployeeContract) => (
          <Text variant="subheader-regular" as="span">
            {translate(`employee:contracts.status.${row.status}`)}
          </Text>
        ),
      },
      {
        key: 'startDate',
        header: translate('employee:contracts.fields.startDate'),
        sortable: true,
        render: (row: EmployeeContract) => row.startDate,
      },
      {
        key: 'endDate',
        header: translate('employee:contracts.fields.endDate'),
        sortable: true,
        render: (row: EmployeeContract) => row.endDate || '-',
      },
      {
        key: 'companyName',
        header: translate('employee:contracts.fields.company'),
        sortable: true,
        render: (row: EmployeeContract) => row.companyName,
      },
      {
        key: 'contractType',
        header: translate('employee:contracts.fields.type'),
        sortable: true,
        render: (row: EmployeeContract) => translate(`employee:contracts.type.${row.contractType}`),
      },
    ],
    [navigate, selectedEmployeeId, translate],
  );

  const actions: TableAction<EmployeeContract>[] = useMemo(
    () => {
      const baseActions: TableAction<EmployeeContract>[] = [
        {
          id: 'edit',
          label: translate('common:actions.edit'),
          icon: 'edit',
          onClick: (row) => {
            if (selectedEmployeeId) {
              const url = ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS_EDITAR.path
                .replace(':employeeId', selectedEmployeeId)
                .replace(':contractId', String(row.contractId));
              void navigate(url);
            }
          },
          color: colors.important.main,
        },
      ];

      // Only add delete action if syncAssistance is false
      if (!syncAssistance) {
        baseActions.push({
          id: 'delete',
          label: translate('common:actions.delete'),
          icon: 'close',
          onClick: (row) => {
            void handleDelete(row);
          },
          color: colors.feedback.error400,
        });
      }

      return baseActions;
    },
    [navigate, selectedEmployeeId, translate, handleDelete, syncAssistance],
  );

  const onSearch = useCallback(
    (term: string) => {
      setSearchText(term);
    },
    [setSearchText],
  );

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
        setPage(1);
      }
    }
  }, [total, page, pageSize]);

  // Configuración del filtro
  const employeeFilterConfig = useMemo(() => [
    {
      key: 'employeeId',
      label: translate('employee:fields.employee'),
      options: MOCK_EMPLOYEES,
      placeholder: 'Seleccione un colaborador',
      defaultValue: selectedEmployeeId,
    },
  ], [translate, selectedEmployeeId]);

  // URL para crear contrato
  const createContractUrl = useMemo(() => {
    if (selectedEmployeeId) {
      return ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS_CREAR.path.replace(':employeeId', selectedEmployeeId);
    }
    return ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS_CREAR.path;
  }, [selectedEmployeeId]);

  // Título dinámico para breadcrumb
  const dynamicTitle = useMemo(() => 
    selectedEmployeeLabel ? `Contratos - ${toCapitalCase(selectedEmployeeLabel)}` : undefined,
  [selectedEmployeeLabel],
  );

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
    selectedEmployeeId,
    selectedEmployeeLabel,
    handleEmployeeChange,
    createContractUrl,
    dynamicTitle,
    employeeFilterConfig,
  };
}

export default useEmployeeContractList;
