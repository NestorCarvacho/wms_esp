import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ROUTE_DEFINITIONS } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useUI } from '@/hooks/ui';
import { employeeContractCreateService } from '@/api/domains/employeeContract/services/employeeContractCreate.service';
import { mapCreateEmployeeContractFormToTransport } from '@/api/domains/employeeContract/mappers/employeeContractCreate.mapper';
import type { ValidatedCreateEmployeeContractFormData } from '@/api/domains/employeeContract/types/employeeContractCreate.types';
import {
  createEmployeeContractSchema,
  type CreateEmployeeContractFormData,
} from '@/schemas/employee/employeeContractCreate.schema';
import { employeeService, type HoldingCompany } from '@/api/domains/employee';


interface UseEmployeeContractCreateResult {
  loading: boolean;
  creating: boolean;
  error: string | null;
  handleCancel: () => void;
  handleCreate: () => Promise<void>;
  contractStatusOptions: { value: string; label: string }[];
  contractTypeOptions: { value: string; label: string }[];
  contractModalityOptions: { value: string; label: string }[];
  companyOptions: { value: string; label: string }[];
  areaOptions: { value: string; label: string }[];
  positionOptions: { value: string; label: string }[];
  costCenterOptions: { value: string; label: string }[];
  unionOptions: { value: string; label: string }[];
  form: {
    register: ReturnType<typeof useForm<CreateEmployeeContractFormData>>['register'];
    setValue: ReturnType<typeof useForm<CreateEmployeeContractFormData>>['setValue'];
    watch: ReturnType<typeof useForm<CreateEmployeeContractFormData>>['watch'];
    errors: ReturnType<typeof useForm<CreateEmployeeContractFormData>>['formState']['errors'];
    trigger: ReturnType<typeof useForm<CreateEmployeeContractFormData>>['trigger'];
  };
}

// Contract status options (1=Activo, 2=Terminado)
const CONTRACT_STATUSES = [
  { value: '1', label: 'Activo' },
  { value: '2', label: 'Terminado' },
];

// Placeholder empty options for catalogs (no endpoints available)
const EMPTY_OPTIONS: { value: string; label: string }[] = [];

export function useEmployeeContractCreate(employeeId?: number): UseEmployeeContractCreateResult {
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const { t: translate } = useTranslation();
  const [loading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holdingCompanies, setHoldingCompanies] = useState<HoldingCompany[]>([]);

  // Load holding companies for company contract dropdown
  useEffect(() => {
    (async () => {
      const response = await employeeService.listHoldingCompanies();
      if (!response.success || !response.data) {
        showNotification('error', 'No se pudieron obtener empresas', 5000);
        return;
      }
      setHoldingCompanies(response.data);
    })().catch(() => {
      showNotification('error', 'Error inesperado obteniendo empresas', 5000);
    });
  }, [showNotification]);

  // React Hook Form instance
  const formMethods = useForm<CreateEmployeeContractFormData>({
    resolver: zodResolver(createEmployeeContractSchema),
    mode: 'onBlur',
    defaultValues: {
      contractNumber: '',
      contractName: '',
      contractStatusId: 1, // Default: Activo
      contractTypeId: undefined,
      dateEntry: undefined,
      contractStartDate: undefined,
      contractEndDate: null,
      contractModalityId: undefined,
      companyContractId: undefined,
      areaId: null,
      positionId: undefined,
      costCenterId: undefined,
      unionCode: null,
    },
  });

  const handleCancel = useCallback(() => {
    const baseUrl = ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS.path;
    const url = employeeId ? `${baseUrl}?employeeId=${employeeId}` : baseUrl;
    void navigate(url);
  }, [navigate, employeeId]);

  const handleCreate = useCallback(async () => {
    const isValid = await formMethods.trigger();
    if (!isValid) {
      showNotification(
        'error',
        translate('common:validation.formErrors'),
        5000,
      );
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const formData = formMethods.getValues();
      
      // Add employeeId from params and convert contractNumber to number
      const formDataWithEmployee: ValidatedCreateEmployeeContractFormData = {
        ...formData,
        employeeId: Number(employeeId),
        contractNumber: Number(formData.contractNumber),
        contractStatusId: formData.contractStatusId,
        contractTypeId: formData.contractTypeId,
        dateEntry: formData.dateEntry,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate ?? null,
        contractModalityId: formData.contractModalityId,
        companyContractId: formData.companyContractId,
        positionId: formData.positionId,
        costCenterId: formData.costCenterId,
        areaId: formData.areaId ?? null,
      };

      const transportData = mapCreateEmployeeContractFormToTransport(formDataWithEmployee);
      const response = await employeeContractCreateService.create(transportData);

      if (response.success && response.data) {
        showNotification(
          'success',
          translate('employee:contracts.messages.created'),
          5000,
        );
        const baseUrl = ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS.path;
        const successUrl = employeeId ? `${baseUrl}?employeeId=${employeeId}` : baseUrl;
        void navigate(successUrl);
      } else if (response.error) {
        const errorMessage = response.error.description || 
          translate('common:errors.unexpected');
        
        // Process backend validation errors if available
        if (response.error.validationErrors) {
          response.error.validationErrors.forEach((validationError) => {
            formMethods.setError(validationError.fieldName as any, {
              type: 'manual',
              message: validationError.errorMessage,
            });
          });
        }
        
        setError(errorMessage);
        showNotification('error', errorMessage, 5000);
      }
    } catch (catchError) {
      const errorMessage = catchError instanceof Error
        ? catchError.message
        : translate('common:errors.unexpected');
      setError(errorMessage);
      showNotification('error', errorMessage, 5000);
    } finally {
      setCreating(false);
    }
  }, [formMethods, employeeId, showNotification, translate, navigate]);

  return {
    loading,
    creating,
    error,
    handleCancel,
    handleCreate,
    contractStatusOptions: CONTRACT_STATUSES,
    contractTypeOptions: EMPTY_OPTIONS,
    contractModalityOptions: EMPTY_OPTIONS,
    companyOptions: holdingCompanies.map((company) => ({
      value: String(company.id),
      label: company.name,
    })),
    areaOptions: EMPTY_OPTIONS,
    positionOptions: EMPTY_OPTIONS,
    costCenterOptions: EMPTY_OPTIONS,
    unionOptions: EMPTY_OPTIONS,
    form: {
      register: formMethods.register,
      setValue: formMethods.setValue,
      watch: formMethods.watch,
      errors: formMethods.formState.errors,
      trigger: formMethods.trigger,
    },
  };
}
