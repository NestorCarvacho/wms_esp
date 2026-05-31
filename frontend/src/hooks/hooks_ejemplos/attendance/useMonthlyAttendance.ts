import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '@/hooks/ui/useUI.ts';
import { useTableSearch } from '@/hooks/ui/table/useTableSearch.ts';
import { formatDateToYYYYMMDD, convertTimeFormat, downloadBlob, calculateDateRange } from '@/utils/index.ts';
import { attendanceService } from '@/api/domains/attendance/attendance.service.ts';
import { MONTH_I18N_KEYS } from '@/i18n/config.ts';
import type { TableColumn, TableAction } from '@/components/ui/tables/Table.tsx';
import type { MonthlyAttendanceRecord, LC_MonthlyCutoffOut } from '@/api/domains/attendance/attendance.types.ts';
import type { MonthlyAttendanceFilters, RangeType } from '@/types/attendanceFilter.types.ts';

/**
 * Dummy data for monthly attendance preview
 * Based on real backend JSON response structure
 */
const MONTHLY_ATTENDANCE_DUMMY_DATA = [
  {
    id: '1',
    fecha: '22/09/2025',
    dia: 'Lun',
    entrada: '08:00:00',
    salida: '19:00:00',
    horasPactadas: '07:00:00',
    horasTrabajadas: '10:00:00',
    horasExtras: '03:00:00',
    horasAusencias: '00:00:00',
    tieneDetalles: true,
    tipoHorasExtras: 'HE Tipo 1\nCantidad de Horas Extras Tipo 1: 03:00:00',
    observacion: 'Normalizado',
  },
  {
    id: '2',
    fecha: '23/09/2025',
    dia: 'Mar',
    entrada: '10:00:00',
    salida: '16:00:00',
    horasPactadas: '07:00:00',
    horasTrabajadas: '05:00:00',
    horasExtras: '00:00:00',
    horasAusencias: '02:00:00',
    tieneDetalles: true,
    tipoHorasExtras: null,
    observacion: 'Normalizado',
  },
  {
    id: '3',
    fecha: '24/09/2025',
    dia: 'Mié',
    entrada: '08:00:00',
    salida: '15:00:00',
    horasPactadas: '07:00:00',
    horasTrabajadas: '06:00:00',
    horasExtras: '00:00:00',
    horasAusencias: '01:00:00',
    tieneDetalles: true,
    tipoHorasExtras: null,
    observacion: 'Normalizado',
  },
  {
    id: '4',
    fecha: '25/09/2025',
    dia: 'Jue',
    entrada: '08:00:00',
    salida: '16:00:00',
    horasPactadas: '07:00:00',
    horasTrabajadas: '07:00:00',
    horasExtras: '03:49:59',
    horasAusencias: '00:00:00',
    tieneDetalles: true,
    tipoHorasExtras: 'HE Tipo 1\nCantidad de Horas Extras Tipo 1: 03:49:59',
    observacion: 'Normalizado',
  },
  {
    id: '5',
    fecha: '26/09/2025',
    dia: 'Vie',
    entrada: '08:00:00',
    salida: '19:00:00',
    horasPactadas: '00:00:00',
    horasTrabajadas: '11:00:00',
    horasExtras: '11:00:00',
    horasAusencias: '00:00:00',
    tieneDetalles: true,
    tipoHorasExtras: 'HE Tipo 2\nCantidad de Horas Extras Tipo 2: 11:00:00',
    observacion: 'Normalizado',
  },
];

// Pure functions for sync logic - easily testable
export const validateCanSearch = (filters: MonthlyAttendanceFilters): boolean => {
  if (filters.searchMode === 'MONTHLY') {
    return !!(filters.year && filters.month && filters.cutoffId);
  }
  return !!(filters.dateFrom && filters.dateTo);
};

export const shouldLoadCutoffs = (
  filters: MonthlyAttendanceFilters,
): boolean =>
  filters.searchMode === 'MONTHLY' && !!(filters.year && filters.month);

export const buildExportFilters = (filters: MonthlyAttendanceFilters) => {
  if (filters.searchMode === 'MONTHLY') {
    return {
      year: filters.year!,
      month: filters.month!,
      cutoffId: filters.cutoffId,
      formatType: filters.formatType,
    };
  }
  return {
    startDate: filters.dateFrom!.replace(/-/g, '/'),
    endDate: filters.dateTo!.replace(/-/g, '/'),
    formatType: filters.formatType,
  };
};

export const useMonthlyAttendance = () => {
  const { t: translate } = useTranslation();
  const { openModal, showSuccess, showError } = useUI();
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const todayDate = formatDateToYYYYMMDD(new Date());
  
  const [filters, setFilters] = useState<MonthlyAttendanceFilters>({
    searchMode: 'MONTHLY',
    year: currentYear,
    month: currentMonth,
    formatType: 'HH:MM:SS',
    dateFrom: todayDate,
    dateTo: todayDate,
    rangeType: 'TODAY',
  });
  
  const [rows, setRows] = useState<MonthlyAttendanceRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [employeeInfo, setEmployeeInfo] = useState({ name: '', id: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [cutoffs, setCutoffs] = useState<LC_MonthlyCutoffOut[]>([]);
  const [loadingCutoffs, setLoadingCutoffs] = useState(false);
  
  const { debouncedSearchText, setSearchText } = useTableSearch({
    onDebouncedChange: () => setPage(1),
  });

  const yearOptions = useMemo(() => {
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push({ value: String(year), label: String(year) });
    }
    return years;
  }, [currentYear]);

  const monthOptions = useMemo(() => 
    Array.from({ length: 12 }, (_, index) => ({
      value: String(index + 1),
      label: translate(`common:months.${MONTH_I18N_KEYS[index]}`),
    }))
  , [translate]);

  const loadMonthlyCutoffs = useCallback(() => {
    if (!filters.year || !filters.month) return;
    
    setLoadingCutoffs(true);
    
    // TODO: Replace with real API call when backend implements getMonthlyCutoffs endpoint
    // Using dummy cutoffs for now since backend is not ready
    const dummyCutoffs: LC_MonthlyCutoffOut[] = [
      {
        id: 1,
        name: 'Corte Quincenal 1 (01-15)',
        startDate: `${filters.year}/${String(filters.month).padStart(2, '0')}/01`,
        endDate: `${filters.year}/${String(filters.month).padStart(2, '0')}/15`,
      },
      {
        id: 2,
        name: 'Corte Quincenal 2 (16-30)',
        startDate: `${filters.year}/${String(filters.month).padStart(2, '0')}/16`,
        endDate: `${filters.year}/${String(filters.month).padStart(2, '0')}/30`,
      },
      {
        id: 3,
        name: 'Corte Mensual Completo',
        startDate: `${filters.year}/${String(filters.month).padStart(2, '0')}/01`,
        endDate: `${filters.year}/${String(filters.month).padStart(2, '0')}/30`,
      },
    ];
    
    setCutoffs(dummyCutoffs);
    
    // Auto-select first cutoff
    setFilters(previousFilters => ({
      ...previousFilters,
      cutoffId: dummyCutoffs[0].id,
    }));
    
    // Show dummy attendance data
    setRows(MONTHLY_ATTENDANCE_DUMMY_DATA);
    setTotalRecords(MONTHLY_ATTENDANCE_DUMMY_DATA.length);
    setEmployeeInfo({
      name: 'Juan Pérez García',
      id: '12.345.678-9',
    });
    setHasSearched(true);
    
    setLoadingCutoffs(false);
  }, [filters.year, filters.month]);

  useEffect(() => {
    if (shouldLoadCutoffs(filters)) {
      loadMonthlyCutoffs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year, filters.month, loadMonthlyCutoffs]);
  
  // Handle cutoff selection change - update dummy data when cutoff changes
  // TODO: Remove this when real API is implemented
  useEffect(() => {
    if (filters.cutoffId && cutoffs.length > 0 && !isLoading) {
      // Refresh dummy data when cutoff changes (simulate different data per cutoff)
      setRows(MONTHLY_ATTENDANCE_DUMMY_DATA);
      setTotalRecords(MONTHLY_ATTENDANCE_DUMMY_DATA.length);
      setHasSearched(true);
    }
  }, [filters.cutoffId, cutoffs.length, isLoading]);

  const canSearch = useMemo(() => validateCanSearch(filters), [filters]);

  const fetchData = useCallback(async () => {
    if (!canSearch) return;
    
    setIsLoading(true);
    
    try {
      let response;
      
      if (filters.searchMode === 'MONTHLY') {
        response = await attendanceService.getMonthlyAttendance({
          year: filters.year!,
          month: filters.month!,
          cutoffId: filters.cutoffId,
          page,
          pageSize,
          searchText: debouncedSearchText || null,
          formatType: filters.formatType,
        });
      } else {
        response = await attendanceService.getAttendanceByRange({
          startDate: filters.dateFrom!.replace(/-/g, '/'),
          endDate: filters.dateTo!.replace(/-/g, '/'),
          page,
          pageSize,
          searchText: debouncedSearchText || null,
          formatType: filters.formatType,
        });
      }
      
      if (response.success && response.data) {
        setRows(response.data.data);
        setTotalRecords(response.data.totalRecords);
        setEmployeeInfo({
          name: response.data.employeeName,
          id: response.data.employeeId,
        });
        setHasSearched(true);
      } else {
        showError(response.error?.description || translate('attendance:monthly.messages.noData'));
        setRows([]);
        setTotalRecords(0);
      }
    } catch {
      showError(translate('common:messages.error'));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize, debouncedSearchText, canSearch, showError, translate]);

  const columns: TableColumn<MonthlyAttendanceRecord>[] = useMemo(() => [
    {
      key: 'fecha',
      header: translate('attendance:monthly.table.date'),
      sortable: true,
    },
    {
      key: 'dia',
      header: translate('attendance:monthly.table.day'),
      align: 'center',
      sortable: true,
    },
    {
      key: 'entrada',
      header: translate('attendance:monthly.table.checkIn'),
      align: 'left',
      sortable: true,
    },
    {
      key: 'salida',
      header: translate('attendance:monthly.table.checkOut'),
      align: 'left',
      sortable: true,
    },
    {
      key: 'horasPactadas',
      header: translate('attendance:monthly.table.agreedHours'),
      align: 'left',
      sortable: true,
      render: (record) => convertTimeFormat(record.horasPactadas, filters.formatType),
    },
    {
      key: 'horasTrabajadas',
      header: translate('attendance:monthly.table.workedHours'),
      align: 'left',
      sortable: true,
      render: (record) => convertTimeFormat(record.horasTrabajadas, filters.formatType),
    },
    {
      key: 'horasExtras',
      header: translate('attendance:monthly.table.overtime'),
      align: 'left',
      sortable: true,
      render: (record) => convertTimeFormat(record.horasExtras, filters.formatType),
    },
    {
      key: 'horasAusencias',
      header: translate('attendance:monthly.table.absences'),
      align: 'left',
      sortable: true,
      render: (record) => convertTimeFormat(record.horasAusencias, filters.formatType),
    },
  ], [translate, filters.formatType]);

  const actions: TableAction<MonthlyAttendanceRecord>[] = useMemo(() => [], []);

  const handleRangeTypeChange = useCallback((rangeType: RangeType) => {
    const { dateFrom, dateTo } = calculateDateRange(
      rangeType,
      formatDateToYYYYMMDD,
    );
    setFilters(previousFilters => ({
      ...previousFilters,
      rangeType,
      dateFrom,
      dateTo,
    }));
  }, []);

  const handleExport = useCallback(async (format: 'EXCEL' | 'PDF' | 'WORD') => {
    if (!hasSearched) {
      showError(translate('attendance:monthly.messages.selectAllFilters'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      const exportFilters = buildExportFilters(filters);
      const response = await attendanceService.exportMonthlyAttendance(format, exportFilters);
      
      if (response.success && response.data) {
        downloadBlob(response.data, `asistencia-mensual.${format.toLowerCase()}`);
        showSuccess(translate('attendance:monthly.messages.exportSuccess'));
      } else {
        showError(response.error?.description || translate('attendance:monthly.messages.exportError'));
      }
    } catch {
      showError(translate('attendance:monthly.messages.exportError'));
    } finally {
      setIsLoading(false);
    }
  }, [filters, hasSearched, showSuccess, showError, translate]);

  const openExportModal = useCallback(() => {
    openModal('ExportModal', {
      onExport: handleExport,
    });
  }, [openModal, handleExport]);

  return {
    filters,
    setFilters,
    rows,
    totalRecords,
    employeeInfo,
    page,
    pageSize,
    isLoading,
    hasSearched,
    cutoffs,
    loadingCutoffs,
    yearOptions,
    monthOptions,
    canSearch,
    fetchData,
    setPage,
    setPageSize,
    onSearch: setSearchText,
    handleRangeTypeChange,
    handleExport,
    openExportModal,
    columns,
    actions,
    dummyData: MONTHLY_ATTENDANCE_DUMMY_DATA,
  };
};
