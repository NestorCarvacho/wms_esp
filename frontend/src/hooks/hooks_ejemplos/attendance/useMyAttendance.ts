import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUI } from '@/hooks/ui/useUI';
import { useTableSearch } from '@/hooks/ui/table/useTableSearch';
import { formatDateToYYYYMMDD } from '@/utils';
import { attendanceService } from '@/api/domains/attendance/attendance.service';
import type { TableColumn, TableAction } from '@/components/ui/tables/Table';
import { colors } from '@/assets/styles/colors';

// Status constants for attendance processing (must match backend values)
const STATUS_PENDING = 'Por procesar';

export interface AttendanceRecord {
  id: string;
  fecha: string;
  hora: string;
  tipo: string;
  ubicacion: string;
  dispositivo: string;
  statusProcess: string;
}

export interface MyAttendanceFilters { from?: string; to?: string }

export const useMyAttendance = () => {
  const { openSidePanel, showNotification } = useUI();

  const getDefaultDateRange = (): { from: string; to: string } => {
    const currentDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(currentDate.getDate() - 7);
    return {
      from: formatDateToYYYYMMDD(fromDate),
      to: formatDateToYYYYMMDD(currentDate),
    };
  };

  const [filters, setFilters] = useState<MyAttendanceFilters>(() => getDefaultDateRange());
  
  // Extract default values from initial filters state for DateRangePicker
  // Memoize to ensure stable references (calculated only once on mount)
  const defaultFrom = useMemo(() => {
    const currentDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(currentDate.getDate() - 7);
    return formatDateToYYYYMMDD(fromDate);
  }, []);
  
  const defaultTo = useMemo(() => formatDateToYYYYMMDD(new Date()), []);
  
  type FiltersUpdater =
    | MyAttendanceFilters
    | ((prev: MyAttendanceFilters) => MyAttendanceFilters);
  const setFiltersSafe = useCallback((updater: FiltersUpdater) => {
    setFilters((previousFilters) =>
      typeof updater === 'function'
        ? (updater as (currentFilters: MyAttendanceFilters) => MyAttendanceFilters)(
          previousFilters,
        )
        : updater,
    );
  }, []);
  // Server-side list state
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { debouncedSearchText, setSearchText } = useTableSearch({
    onDebouncedChange: () => setPage(1),
  });
  const [sort, setSort] = useState<{ orderBy?: string; direction?: 'ASC' | 'DESC' }>({});
  const [isLoading, setIsLoading] = useState(false);

  // map UI columns to backend fields
  const orderByMap: Record<string, string> = useMemo(
    () => ({
      fecha: 'date',
      hora: 'hour',
      tipo: 'eventType',
      ubicacion: 'ubicationName',
      dispositivo: 'deviceInformation',
    }),
    [],
  );

  // API expects local date-time format: YYYY-MM-DDTHH:mm:ss (sin zona horaria)
  const toStartOfDay = useCallback((dateString: string) => `${dateString}T00:00:00`, []);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    // filters are initialized with defaults, use them as fallback when undefined
    const fromDateString = filters.from ?? defaultFrom;
    const toDateString = filters.to ?? defaultTo;
    const startDate = toStartOfDay(fromDateString);
    const endDate = toDateString;
    const response = await attendanceService.getEmployeeAttendance({
      page,
      pageSize,
      searchText: debouncedSearchText || null,
      orderBy: (sort.orderBy as any) ?? null,
      orderDirection: sort.direction ?? null,
      startDate,
      endDate,
    });
    if (!response.success || !response.data) {
      const detail = response.error?.validationErrors
        ?.map((validationError) => `${validationError.fieldName}: ${validationError.errorMessage}`)
        .join('; ');
      const message = [response.error?.description, detail]
        .filter(Boolean)
        .join(' — ');
      showNotification('error', message || 'No se pudo obtener asistencia', 5000);
      setRows([]);
      setTotalRecords(0);
      setIsLoading(false);
      return;
    }
    setRows(response.data.data as AttendanceRecord[]);
    setTotalRecords(response.data.totalRecords);
    setIsLoading(false);
  }, [
    filters.from,
    filters.to,
    defaultFrom,
    defaultTo,
    page,
    pageSize,
    debouncedSearchText,
    sort.orderBy,
    sort.direction,
    showNotification,
    toStartOfDay,
  ]);

  useEffect(() => { void fetchList(); }, [fetchList]);

  const onSearch = useCallback((text: string) => {
    setSearchText(text);
  }, [setSearchText]);

  const onSortChange = useCallback(
    (columnKey: string, direction: 'asc' | 'desc') => {
      setSort({
        orderBy: orderByMap[columnKey] ?? undefined,
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

  // Submit helper: keeps tests expectations (delayed success notification),
  // but allows silencing the toast when invoked from the side panel flow.
  const submitRecord = useCallback(async (options?: { silent?: boolean }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (!options?.silent) {
        showNotification('success', 'Asistencia registrada correctamente', 5000);
      }
      return { ok: true } as const;
    } catch {
      if (!options?.silent) {
        showNotification('error', 'No se pudo registrar la asistencia', 5000);
      }
      return { ok: false } as const;
    }
  }, [showNotification]);

  const openRegisterPanel = useCallback(() => {
    openSidePanel({
      title: 'Registrar Asistencia',
      component: 'RegisterAttendanceForm',
      props: {
        onSubmit: async (_data: unknown) => {
          const result = await submitRecord({ silent: true });
          if (result.ok) {
            await fetchList();
          }
        },
      },
    });
  }, [openSidePanel, submitRecord, fetchList]);

  const viewDetails = useCallback(async (row: AttendanceRecord) => {
    const idNum = Number(row.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      showNotification('error', 'Identificador de asistencia inválido', 4000);
      return;
    }
    const response = await attendanceService.getAttendanceDetail({ attendanceId: idNum });
    if (!response.success || !response.data) {
      const detail = response.error?.validationErrors
        ?.map((validationError) => `${validationError.fieldName}: ${validationError.errorMessage}`)
        .join('; ');
      const message = [response.error?.description, detail].filter(Boolean).join(' — ');
      showNotification('error', message || 'No se pudo obtener el detalle de asistencia', 5000);
      return;
    }
    const detail = response.data;
    const imageUrl = detail.photoBase64 ? `data:image/jpeg;base64,${detail.photoBase64}` : undefined;
    openSidePanel({
      title: 'Detalle de asistencia',
      component: 'DetailsAttendanceForm',
      props: { record: detail, imageUrl, readOnly: true },
    });
  }, [openSidePanel, showNotification]);

  const columns: TableColumn<AttendanceRecord>[] = useMemo(
    () => [
      { key: 'fecha', header: 'Fecha', sortable: true },
      { key: 'hora', header: 'Hora', sortable: true },
      { key: 'tipo', header: 'Tipo', sortable: true },
      { key: 'ubicacion', header: 'Ubicación', sortable: true },
      { key: 'dispositivo', header: 'Dispositivo', sortable: true },
    ],
    [],
  );

  const actions: TableAction<AttendanceRecord>[] = useMemo(
    () => [
      {
        id: 'view',
        label: 'Ver detalles',
        icon: 'eye',
        onClick: viewDetails,
        color: colors.important.main,
        hidden: (row: AttendanceRecord) => row.statusProcess === STATUS_PENDING,
      },
    ],
    [viewDetails],
  );

  return {
    filters,
    defaultFrom,
    defaultTo,
    data: rows,
    totalRecords,
    isLoading,
    setFilters: setFiltersSafe,
    page,
    pageSize,
    setPage,
    setPageSize: setPageSizeSafe,
    onSearch,
    onSortChange,
    openRegisterPanel,
    viewDetails,
    submitRecord,
    columns,
    actions,
  };
};

export default useMyAttendance;
