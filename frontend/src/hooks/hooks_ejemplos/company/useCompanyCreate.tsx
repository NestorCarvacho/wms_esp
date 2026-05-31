import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ROUTE_DEFINITIONS } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks';
import { useUI } from '@/hooks/ui';
import { companyService } from '@/api/domains/company';
import { employeeService } from '@/api/domains/employee';
import { type Region, type Commune } from '@/api/domains/geography';
import { type HoldingCompany } from '@/api/domains/employee';
import { mapCreateCompanyFormToTransport } from '@/api/domains/company/mappers';
import { type ValidatedCreateCompanyFormData } from '@/api/domains/company/types';
import {
  createCompanyInfoSchema,
  createCompanyConfigSchema,
  type CreateCompanyInfo,
  type CreateCompanyConfig,
} from '@/schemas/company';
import { processBackendValidationErrors } from '@/utils/formValidationErrors';
import { useCompanyLogo, type UseCompanyLogoReturn } from './useCompanyLogo';


interface UseCompanyCreateResult {
  loading: boolean;
  error: string | null;
  activeTab: 'info' | 'config';
  setActiveTab: (tab: 'info' | 'config') => void;
  currentStepIndex: number;
  completedSteps: Set<number>;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  handleCancel: () => void;
  handleCreate: () => Promise<void>;
  handleCopySeedAssistance: () => void;
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  holdingCompanyOptions: { value: string; label: string }[];
  creating: boolean;
  logoHook: UseCompanyLogoReturn;
  infoForm: {
    register: ReturnType<typeof useForm<CreateCompanyInfo>>['register'];
    setValue: ReturnType<typeof useForm<CreateCompanyInfo>>['setValue'];
    watch: ReturnType<typeof useForm<CreateCompanyInfo>>['watch'];
    errors: ReturnType<typeof useForm<CreateCompanyInfo>>['formState']['errors'];
    trigger: ReturnType<typeof useForm<CreateCompanyInfo>>['trigger'];
  };
  configForm: {
    register: ReturnType<typeof useForm<CreateCompanyConfig>>['register'];
    setValue: ReturnType<typeof useForm<CreateCompanyConfig>>['setValue'];
    watch: ReturnType<typeof useForm<CreateCompanyConfig>>['watch'];
    errors: ReturnType<typeof useForm<CreateCompanyConfig>>['formState']['errors'];
    trigger: ReturnType<typeof useForm<CreateCompanyConfig>>['trigger'];
  };
}

export function useCompanyCreate(): UseCompanyCreateResult {
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const { t: translate } = useTranslation();
  const seedAssistance = useAppSelector((state) => state.auth.user?.seedAssistance ?? null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, internalSetActiveTab] = useState<'info' | 'config'>('info');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Catalog states
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [holdingCompanies, setHoldingCompanies] = useState<HoldingCompany[]>([]);

  // React Hook Form instances for each tab
  const infoFormMethods = useForm<CreateCompanyInfo>({
    resolver: zodResolver(createCompanyInfoSchema),
    mode: 'onBlur',
    defaultValues: {
      rutComplete: '',
      companyName: '',
      companyNameFantasy: '',
      companyAddress: '',
      companyAddressNumber: '',
      regionId: null,
      communeId: null,
      namePersonContact: '',
      emailPersonContact: '',
      telephonePersonContact: '',
    },
  });

  const configFormMethods = useForm<CreateCompanyConfig>({
    resolver: zodResolver(createCompanyConfigSchema),
    mode: 'onBlur',
    defaultValues: {
      fatherCompanyId: undefined,
      terminateEmployeesWithExpiredContract: false,
      estCompanyType: null,
      synchronizeWithREX: false,
      rexid: '',
      rexurl: '',
      hasAttendanceIntengrationREX: false,
    },
  });

  // Initialize logo hook for company logo upload
  const logoHook = useCompanyLogo({
    companyId: undefined, // Will be set after company creation
    currentLogoUrl: null,
    onLogoUpdated: () => {
      // Logo updated successfully
    },
    onError: () => {
      // Error handled by hook
    },
  });

  // Load catalogs on mount (regions, holding companies)
  useEffect(() => {
    let mounted = true;
    const loadCatalogs = async () => {
      setLoading(true);
      
      let regionsResponse: 
        | Awaited<ReturnType<typeof companyService.getRegions>> 
        | undefined;
      let holdingResponse:
        | Awaited<ReturnType<typeof employeeService.listHoldingCompanies>>
        | undefined;
      
      try {
        regionsResponse = await companyService.getRegions('CL');
      } catch {
        if (mounted) {
          setError('Error al cargar regiones');
        }
      }

      try {
        holdingResponse = await employeeService.listHoldingCompanies();
      } catch {
        if (mounted) {
          setError('Error al cargar empresas holding');
        }
      }

      if (mounted && regionsResponse?.success && regionsResponse.data) {
        setRegions(regionsResponse.data);
      }

      if (mounted && holdingResponse?.success && holdingResponse.data) {
        setHoldingCompanies(holdingResponse.data);
      }

      if (mounted) setLoading(false);
    };
    void loadCatalogs();
    return () => {
      mounted = false;
    };
  }, []);

  // Load communes when region changes
  const regionIdValue = infoFormMethods.watch('regionId');

  useEffect(() => {
    let mounted = true;
    const loadCommunes = async () => {
      if (!regionIdValue) {
        setCommunes([]);
        // Reset commune when region changes
        infoFormMethods.setValue('communeId', null);
        return;
      }

      let communesResponse;
      
      try {
        communesResponse = await companyService.getCommunes(regionIdValue);
      } catch {
        if (mounted) setCommunes([]);
        return;
      }

      if (mounted && communesResponse.success && communesResponse.data) {
        setCommunes(communesResponse.data);
      } else if (mounted) {
        setCommunes([]);
      }
    };
    void loadCommunes();
    return () => {
      mounted = false;
    };
    // La referencia a infoFormMethods (requerido por lint) causaba loops infinitos. 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionIdValue]);  const setActiveTab = useCallback(
    (tab: 'info' | 'config') => {
      internalSetActiveTab(tab);
    },
    [],
  );

  // Map tabs to step indices for wizard
  const tabToIndex: Record<'info' | 'config', number> = {
    info: 0,
    config: 1,
  };

  const currentStepIndex = tabToIndex[activeTab];

  // Handle next step with validation
  const handleNext = useCallback(async () => {
    if (activeTab === 'info') {
      const isValid = await infoFormMethods.trigger();
      if (isValid) {
        setCompletedSteps((previous) => new Set([...previous, 0]));
        internalSetActiveTab('config');
      } else {
        showNotification(
          'error',
          'Por favor corrige los errores antes de continuar',
          4000,
        );
      }
    }
  }, [activeTab, infoFormMethods, showNotification]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (activeTab === 'config') {
      internalSetActiveTab('info');
    }
  }, [activeTab]);

  const handleCancel = useCallback(() => {
    void navigate(ROUTE_DEFINITIONS.EMPRESAS.path);
  }, [navigate]);

  const handleCopySeedAssistance = useCallback(() => {
    if (!seedAssistance) {
      showNotification('warning', translate('common:messages.noDataToCopy'), 3000);
      return;
    }

    navigator.clipboard.writeText(seedAssistance)
      .then(() => {
        showNotification('info', translate('common:messages.copiedToClipboard'), 3000);
      })
      .catch(() => {
        showNotification('error', translate('common:messages.copyFailed'), 3000);
      });
  }, [seedAssistance, showNotification, translate]);

  // Build field mapping for backend validation error injection (memoized)
  const buildFieldMapping = useMemo(() => ({
    // Info tab fields
    rutComplete: { tab: 'info' as const, formInstance: infoFormMethods },
    companyName: { tab: 'info' as const, formInstance: infoFormMethods },
    companyNameFantasy: { tab: 'info' as const, formInstance: infoFormMethods },
    estCompanyType: { tab: 'info' as const, formInstance: infoFormMethods },
    companyAddress: { tab: 'info' as const, formInstance: infoFormMethods },
    companyAddressNumber: { tab: 'info' as const, formInstance: infoFormMethods },
    regionId: { tab: 'info' as const, formInstance: infoFormMethods },
    communeId: { tab: 'info' as const, formInstance: infoFormMethods },

    // Config tab fields
    fatherCompanyId: { tab: 'config' as const, formInstance: configFormMethods },
    terminateEmployeesWithExpiredContract: { tab: 'config' as const, formInstance: configFormMethods },
    synchronizeWithREX: { tab: 'config' as const, formInstance: configFormMethods },
    rexid: { tab: 'config' as const, formInstance: configFormMethods },
    rexurl: { tab: 'config' as const, formInstance: configFormMethods },
    hasAttendanceIntengrationREX: { tab: 'config' as const, formInstance: configFormMethods },
    namePersonContact: { tab: 'config' as const, formInstance: configFormMethods },
    emailPersonContact: { tab: 'config' as const, formInstance: configFormMethods },
    telephonePersonContact: { tab: 'config' as const, formInstance: configFormMethods },
  }), [infoFormMethods, configFormMethods]);

  // Validate all forms and return validation state
  const validateAllForms = useCallback(async () => {
    const [infoValid, configValid] = await Promise.all([
      infoFormMethods.trigger(),
      configFormMethods.trigger(),
    ]);

    return { infoValid, configValid };
  }, [infoFormMethods, configFormMethods]);

  // Navigate to first tab with validation errors
  const navigateToFirstErrorTab = useCallback((validationState: {
    infoValid: boolean;
    configValid: boolean;
  }) => {
    if (!validationState.infoValid) {
      internalSetActiveTab('info');
    } else if (!validationState.configValid) {
      internalSetActiveTab('config');
    }
  }, []);

  // Handle backend validation errors
  const handleBackendValidationError = useCallback((
    validationErrors: Array<{ fieldName: string; errorMessage: string }>,
  ) => {
    processBackendValidationErrors(
      validationErrors,
      buildFieldMapping,
      internalSetActiveTab,
    );
    showNotification('error', 'Corrige los errores de validación', 4000);
  }, [buildFieldMapping, showNotification]);

  // Handle other backend errors (conflict, generic errors)
  const handleBackendError = useCallback((
    errorCode?: string | null,
    errorDescription?: string,
    errorDetail?: string | null,
  ) => {
    const errorMessage = errorDescription || 'Error al crear la empresa';

    if (errorCode === 'CONFLICT_DUPLICATE_COMPANY') {
      showNotification('error', 'El RUT ya está registrado', 4000);
    } else if (errorCode === 'NOT_FOUND_HOLDING') {
      showNotification('error', 'Holding no encontrado para la empresa padre seleccionada', 5000);
    } else if (errorDetail) {
      showNotification('error', `${errorMessage}: ${errorDetail}`, 5000);
    } else {
      showNotification('error', errorMessage, 4000);
    }

    setError(errorMessage);
  }, [showNotification]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    setError(null);

    try {
      // Validate all forms before submission
      const validationState = await validateAllForms();
      const { infoValid, configValid } = validationState;

      // If validation failed, show errors and navigate to first error tab
      if (!infoValid || !configValid) {
        showNotification(
          'error',
          'Por favor corrige los errores en el formulario',
          4000,
        );
        navigateToFirstErrorTab(validationState);
        setCreating(false);
        return;
      }

      // Combine all form data
      const fullData = {
        ...infoFormMethods.getValues(),
        ...configFormMethods.getValues(),
      } as ValidatedCreateCompanyFormData;

      // Map form data to transport DTO and call API
      const transportData = mapCreateCompanyFormToTransport(fullData);
      const response = await companyService.create(transportData);

      // Handle response
      if (response.success && response.data?.companyId) {
        const createdCompanyId = response.data.companyId;

        // Company created successfully - show success notification
        showNotification('success', translate('company:messages.created'), 4000);

        // If logo was cropped, attempt to upload it
        if (logoHook.croppedLogoUrl) {
          const logoResult = await companyService.updateLogo(
            createdCompanyId,
            logoHook.croppedLogoUrl,
          );

          if (!logoResult.success) {
            // Logo upload failed, but company was created - show warning
            showNotification(
              'warning',
              translate('company:messages.logoUploadWarning', { 
                error: logoResult.error || translate('company:logo.errors.unknownError'), 
              }),
              5000,
            );
          }
        }

        // Navigate to companies list
        void navigate(ROUTE_DEFINITIONS.EMPRESAS.path);
      } else if (response.error?.code === 'VALIDATION_ERROR' && response.error.validationErrors) {
        handleBackendValidationError(response.error.validationErrors);
        setCreating(false);
      } else {
        handleBackendError(
          response.error?.code,
          response.error?.description,
          response.error?.detail,
        );
      }
    } catch {
      const errorMessage = 'Error inesperado al crear la empresa';
      showNotification('error', errorMessage, 4000);
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  }, [
    translate,
    navigate,
    showNotification,
    infoFormMethods,
    configFormMethods,
    validateAllForms,
    navigateToFirstErrorTab,
    handleBackendValidationError,
    handleBackendError,
    logoHook,
  ]);

  // Transform to selector options
  const regionOptions = useMemo(
    () =>
      regions.map((region) => ({
        value: String(region.id),
        label: region.name,
      })),
    [regions],
  );

  const communeOptions = useMemo(
    () =>
      communes.map((commune) => ({
        value: String(commune.id),
        label: commune.name,
      })),
    [communes],
  );

  const holdingCompanyOptions = useMemo(
    () =>
      holdingCompanies.map((company) => ({
        value: String(company.id),
        label: company.name,
      })),
    [holdingCompanies],
  );

  return {
    loading,
    error,
    activeTab,
    setActiveTab,
    currentStepIndex,
    completedSteps,
    handleNext,
    handlePrevious,
    handleCancel,
    handleCreate,
    handleCopySeedAssistance,
    regionOptions,
    communeOptions,
    holdingCompanyOptions,
    creating,
    logoHook,
    infoForm: {
      register: infoFormMethods.register,
      setValue: infoFormMethods.setValue,
      watch: infoFormMethods.watch,
      errors: infoFormMethods.formState.errors,
      trigger: infoFormMethods.trigger,
    },
    configForm: {
      register: configFormMethods.register,
      setValue: configFormMethods.setValue,
      watch: configFormMethods.watch,
      errors: configFormMethods.formState.errors,
      trigger: configFormMethods.trigger,
    },
  };
}
