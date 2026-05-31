import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks';
import { useUI } from '@/hooks/ui/useUI';
import { employeeService } from '@/api/domains/employee';
import { downloadBlob } from '@/utils';
import type { EmployeeExportFilters } from '@/api/domains/employee';


export interface UseEmployeeExportParams {
  searchText?: string;
  statusFilter?: 'ALL' | 'V' | 'NV';
}

interface UseEmployeeExportResult {
  exportEmployees: (format: 'EXCEL' | 'PDF' | 'WORD') => Promise<void>;
  isExporting: boolean;
}

/**
 * Hook for exporting employee data to Excel
 * Handles the export logic, file download, and user notifications
 */
export function useEmployeeExport(params: UseEmployeeExportParams): UseEmployeeExportResult {
  const { t: translate } = useTranslation();
  const { showNotification } = useUI();
  const [isExporting, setIsExporting] = useState(false);
  const companyId = useAppSelector((state) => state.auth.user?.idEmpresa);

  const exportEmployees = useCallback(async (format: 'EXCEL' | 'PDF' | 'WORD') => {
    // Only Excel is supported by backend
    if (format !== 'EXCEL') {
      showNotification('error', translate('employee:messages.exportError'), 5000);
      return;
    }

    if (!companyId) {
      showNotification('error', translate('employee:messages.exportError'), 5000);
      return;
    }

    setIsExporting(true);

    try {
      const exportFilters: EmployeeExportFilters = {
        companyId,
        searchText: params.searchText,
        statusFilter: params.statusFilter || 'ALL',
      };

      const response = await employeeService.exportEmployees('Excel', exportFilters);

      if (response.success && response.data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `Colaboradores_${timestamp}.xlsx`;
        downloadBlob(response.data, filename);
        showNotification('success', translate('employee:messages.exportSuccess'), 5000);
      } else {
        showNotification(
          'error',
          response.error?.description || translate('employee:messages.exportError'),
          5000,
        );
      }
    } catch {
      showNotification('error', translate('employee:messages.exportError'), 5000);
    } finally {
      setIsExporting(false);
    }
  }, [params.searchText, params.statusFilter, companyId, showNotification, translate]);

  return {
    exportEmployees,
    isExporting,
  };
}
