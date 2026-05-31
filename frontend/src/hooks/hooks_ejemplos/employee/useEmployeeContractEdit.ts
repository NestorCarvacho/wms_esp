import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ROUTE_DEFINITIONS } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useUI } from '@/hooks/ui';
import { employeeContractService } from '@/api/domains/employeeContract/employeeContract.service.unified';
import {
  mapEmployeeContractToForm,
  mapUpdateEmployeeContractFormToTransport,
} from '@/api/domains/employeeContract/mappers/employeeContractEdit.mapper';
import type {
  LC_GetEmployeeContractByIdOut,
  ValidatedUpdateEmployeeContractFormData,
} from '@/api/domains/employeeContract/types/employeeContractEdit.types';
import {
  updateEmployeeContractSchema,
  type UpdateEmployeeContractFormData,
} from '@/schemas/employee/employeeContractEdit.schema';
import { employeeService, type HoldingCompany } from '@/api/domains/employee';


interface UseEmployeeContractEditResult {
  loading: boolean;
  updating: boolean;
  error: string | null;
  handleCancel: () => void;
  handleUpdate: () => Promise<void>;
  handleSaveContract: (contractData: ValidatedUpdateEmployeeContractFormData) => Promise<void>;
  contractStatusOptions: { value: string; label: string }[];
  contractTypeOptions: { value: string; label: string }[];
  contractModalityOptions: { value: string; label: string }[];
  companyOptions: { value: string; label: string }[];
  areaOptions: { value: string; label: string }[];
  positionOptions: { value: string; label: string }[];
  costCenterOptions: { value: string; label: string }[];
  unionOptions: { value: string; label: string }[];
  form: {
    register: ReturnType<typeof useForm<UpdateEmployeeContractFormData>>['register'];
    setValue: ReturnType<typeof useForm<UpdateEmployeeContractFormData>>['setValue'];
    watch: ReturnType<typeof useForm<UpdateEmployeeContractFormData>>['watch'];
    errors: ReturnType<typeof useForm<UpdateEmployeeContractFormData>>['formState']['errors'];
    trigger: ReturnType<typeof useForm<UpdateEmployeeContractFormData>>['trigger'];
    setError: ReturnType<typeof useForm<UpdateEmployeeContractFormData>>['setError'];
  };
}

// Contract status options (1=Activo, 2=Terminado)
const CONTRACT_STATUSES = [
  { value: '1', label: 'Activo' },
  { value: '2', label: 'Terminado' },
];

// Placeholder empty options for catalogs (no endpoints available)
const EMPTY_OPTIONS: { value: string; label: string }[] = [];

// Pure helper function to build validated contract data - fully testable
export function buildValidatedContractData(
  formData: UpdateEmployeeContractFormData,
  employeeId: number,
): ValidatedUpdateEmployeeContractFormData {
  return {
    ...formData,
    employeeId,
    contractNumber: formData.contractNumber,
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
}

export function useEmployeeContractEdit(
  employeeId?: number,
  contractId?: number,
): UseEmployeeContractEditResult {
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const { t: translate } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holdingCompanies, setHoldingCompanies] = useState<HoldingCompany[]>([]);

  // React Hook Form instance
  const formMethods = useForm<UpdateEmployeeContractFormData>({
    resolver: zodResolver(updateEmployeeContractSchema),
    mode: 'onBlur',
    defaultValues: {
      contractNumber: 0,
      contractName: '',
      contractStatusId: 1,
      contractTypeId: undefined,
      dateEntry: '',
      contractStartDate: '',
      contractEndDate: null,
      contractModalityId: undefined,
      companyContractId: undefined,
      areaId: null,
      positionId: undefined,
      costCenterId: undefined,
      unionCode: null,
    },
  });

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

  // Load contract data on mount
  useEffect(() => {
    if (!contractId) {
      setError('Identificador de contrato inválido');
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await employeeContractService.get(contractId);

        if (!response.success || !response.data) {
          const errorMessage = response.error?.description || 
            translate('employee:contracts.messages.notFound');
          setError(errorMessage);
          showNotification('error', errorMessage, 5000);
          return;
        }

        const contract: LC_GetEmployeeContractByIdOut = response.data;

        // Map transport data to form and populate
        const formData = mapEmployeeContractToForm(contract);
        Object.entries(formData).forEach(([key, value]) => {
          formMethods.setValue(
            key as keyof UpdateEmployeeContractFormData,
            value as any,
          );
        });
      } catch (catchError) {
        const errorMessage = catchError instanceof Error
          ? catchError.message
          : translate('common:errors.unexpected');
        setError(errorMessage);
        showNotification('error', errorMessage, 5000);
      } finally {
        setLoading(false);
      }
    })().catch(() => {
      setError(translate('common:errors.unexpected'));
      setLoading(false);
    });
  }, [contractId, formMethods, showNotification, translate]);

  const handleCancel = useCallback(() => {
    const baseUrl = ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS.path;
    const url = employeeId ? `${baseUrl}?employeeId=${employeeId}` : baseUrl;
    void navigate(url);
  }, [navigate, employeeId]);

  // Pure business logic handler - testable without form mocking
  const handleSaveContract = useCallback(
    async (contractData: ValidatedUpdateEmployeeContractFormData) => {
      setUpdating(true);
      setError(null);

      try {
        const transportData = mapUpdateEmployeeContractFormToTransport(contractData);
        const response = await employeeContractService.update(
          contractData.contractNumber,
          transportData,
        );

        if (response.success && response.data) {
          showNotification(
            'success',
            translate('employee:contracts.messages.updated'),
            5000,
          );
          const baseUrl = ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS.path;
          const successUrl = employeeId ? `${baseUrl}?employeeId=${employeeId}` : baseUrl;
          void navigate(successUrl);
        } else if (response.error) {
          const errorMessage =
            response.error.description || translate('common:errors.unexpected');

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
        const errorMessage =
          catchError instanceof Error
            ? catchError.message
            : translate('common:errors.unexpected');
        setError(errorMessage);
        showNotification('error', errorMessage, 5000);
      } finally {
        setUpdating(false);
      }
    },
    [employeeId, showNotification, translate, navigate, formMethods],
  );

  // Wrapper for form validation - thin layer
  const handleUpdate = useCallback(async () => {
    const isValid = await formMethods.trigger();
    if (!isValid) {
      showNotification('error', translate('common:validation.formErrors'), 5000);
      return;
    }

    const formData = formMethods.getValues();
    const contractData = buildValidatedContractData(formData, Number(employeeId));

    await handleSaveContract(contractData);
  }, [formMethods, employeeId, handleSaveContract, showNotification, translate]);

  return {
    loading,
    updating,
    error,
    handleCancel,
    handleUpdate,
    handleSaveContract,
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
      setError: formMethods.setError,
    },
  };
}
