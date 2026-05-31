import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTE_DEFINITIONS } from '@/routes';
import { employeeGet, employeeService } from '@/api/domains/employee';
import type { Region, Commune } from '@/api/domains/geography';
import type { MaritalStatus } from '@/api/domains/catalog';
import type { ValidatedCreateEmployeeFormData } from '@/api/domains/employee/types';
import { mapCreateEmployeeFormToTransport } from '@/api/domains/employee/mappers/employeeCreate.mapper';
import {
  createEmployeeAddressDataSchema,
  createEmployeeContactDataSchema,
  createEmployeePersonalDataSchema,
  type CreateEmployeePersonalData,
  type CreateEmployeeContactData,
  type CreateEmployeeAddressData,
} from '@/schemas/employee/createEmployeeForm';
import { useAppSelector, useUI } from '@/hooks';
import { processBackendValidationErrors } from '@/utils/formValidationErrors';


interface UseEmployeeCreateResult {
  loading: boolean;
  error: string | null;
  activeTab: 'personal' | 'contact' | 'address';
  setActiveTab: (tab: 'personal' | 'contact' | 'address') => void;
  currentStepIndex: number;
  completedSteps: Set<number>;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  handleCancel: () => void;
  handleCreate: () => Promise<void>;
  genderOptions: { value: string; label: string }[];
  maritalStatusOptions: { value: string; label: string }[];
  employmentStatusOptions: { value: string; label: string }[];
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  creating: boolean;
  usernameSuffix: string | null;
  generatedUsername: string;
  personalForm: {
    register: ReturnType<typeof useForm<CreateEmployeePersonalData>>['register'];
    setValue: ReturnType<typeof useForm<CreateEmployeePersonalData>>['setValue'];
    watch: ReturnType<typeof useForm<CreateEmployeePersonalData>>['watch'];
    errors: ReturnType<typeof useForm<CreateEmployeePersonalData>>['formState']['errors'];
    trigger: ReturnType<typeof useForm<CreateEmployeePersonalData>>['trigger'];
  };
  contactForm: {
    register: ReturnType<typeof useForm<CreateEmployeeContactData>>['register'];
    setValue: ReturnType<typeof useForm<CreateEmployeeContactData>>['setValue'];
    watch: ReturnType<typeof useForm<CreateEmployeeContactData>>['watch'];
    errors: ReturnType<typeof useForm<CreateEmployeeContactData>>['formState']['errors'];
    trigger: ReturnType<typeof useForm<CreateEmployeeContactData>>['trigger'];
  };
  addressForm: {
    register: ReturnType<typeof useForm<CreateEmployeeAddressData>>['register'];
    setValue: ReturnType<typeof useForm<CreateEmployeeAddressData>>['setValue'];
    watch: ReturnType<typeof useForm<CreateEmployeeAddressData>>['watch'];
    errors: ReturnType<typeof useForm<CreateEmployeeAddressData>>['formState']['errors'];
    trigger: ReturnType<typeof useForm<CreateEmployeeAddressData>>['trigger'];
  };
}

// Gender options (M/F as per backend)
const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

// Employment status options (V=Vigente, NV=No Vigente)
const EMPLOYMENT_STATUSES = [
  { value: 'V', label: 'Vigente' },
  { value: 'N', label: 'No Vigente' },
];

export function useEmployeeCreate(): UseEmployeeCreateResult {
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const usernameSuffix = useAppSelector((state) =>
    state.auth.user?.usernameSuffix ?? null,
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, internalSetActiveTab] = useState<
    'personal' | 'contact' | 'address'
  >('personal');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Catalog states
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);

  // React Hook Form instances for each tab
  const personalFormMethods = useForm<CreateEmployeePersonalData>({
    resolver: zodResolver(createEmployeePersonalDataSchema),
    mode: 'onBlur',
    defaultValues: {
      rutComplete: '',
      firstNames: '',
      lastName: '',
      secondLastName: '',
      birthDate: '',
      genderCode: '',
      maritalStatusId: 0,
      employmentStatus: 'V',
      password: '',
    },
  });

  const contactFormMethods = useForm<CreateEmployeeContactData>({
    resolver: zodResolver(createEmployeeContactDataSchema),
    mode: 'onBlur',
    defaultValues: {
      corporateEmail: '',
      personalEmail: '',
      companyPhoneNumber: '',
      personalPhoneNumber: '',
    },
  });

  const addressFormMethods = useForm<CreateEmployeeAddressData>({
    resolver: zodResolver(createEmployeeAddressDataSchema),
    mode: 'onBlur',
    defaultValues: {
      address: '',
      regionId: null,
      communeId: null,
    },
  });

  // Load catalogs on mount (regions, marital statuses)
  useEffect(() => {
    let mounted = true;
    const loadCatalogs = async () => {
      setLoading(true);
      try {
        const regionsResponse = await employeeGet.getRegions('CL');
        if (mounted && regionsResponse.success && regionsResponse.data) {
          setRegions(regionsResponse.data);
        }

        const maritalStatusResponse = await employeeGet.getMaritalStatuses(1);
        if (
          mounted && maritalStatusResponse.success && maritalStatusResponse.data
        ) {
          setMaritalStatuses(maritalStatusResponse.data);
        }
      } catch {
        if (mounted) {
          setError('Error al cargar catálogos');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void loadCatalogs();
    return () => {
      mounted = false;
    };
  }, []);

  // Load communes when region changes
  const regionIdValue = addressFormMethods.watch('regionId');

  useEffect(() => {
    let mounted = true;
    const loadCommunes = async () => {
      if (!regionIdValue) {
        setCommunes([]);
        // Reset commune when region changes
        addressFormMethods.setValue('communeId', null);
        return;
      }

      try {
        const communesResponse = await employeeGet.getCommunes(regionIdValue);
        if (mounted && communesResponse.success && communesResponse.data) {
          setCommunes(communesResponse.data);
        } else if (mounted) {
          setCommunes([]);
        }
      } catch {
        if (mounted) setCommunes([]);
      }
    };
    void loadCommunes();
    return () => {
      mounted = false;
    };
    // La referencia a addressFormMethods (requerido por lint) causaba loops infinitos. 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionIdValue]);

  const setActiveTab = useCallback(
    (tab: 'personal' | 'contact' | 'address') => {
      internalSetActiveTab(tab);
    },
    [],
  );

  // Map tabs to step indices for wizard
  const tabToIndex: Record<'personal' | 'contact' | 'address', number> = {
    personal: 0,
    contact: 1,
    address: 2,
  };

  const currentStepIndex = tabToIndex[activeTab];

  // Handle next step with validation
  const handleNext = useCallback(async () => {
    let isValid = false;
    
    if (activeTab === 'personal') {
      isValid = await personalFormMethods.trigger();
      if (isValid) {
        setCompletedSteps(prev => new Set([...prev, 0]));
        internalSetActiveTab('contact');
      }
    } else if (activeTab === 'contact') {
      isValid = await contactFormMethods.trigger();
      if (isValid) {
        setCompletedSteps(prev => new Set([...prev, 1]));
        internalSetActiveTab('address');
      }
    }

    if (!isValid) {
      showNotification(
        'error',
        'Por favor corrige los errores antes de continuar',
        4000,
      );
    }
  }, [activeTab, personalFormMethods, contactFormMethods, showNotification]);

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (activeTab === 'contact') {
      internalSetActiveTab('personal');
    } else if (activeTab === 'address') {
      internalSetActiveTab('contact');
    }
  }, [activeTab]);

  const handleCancel = useCallback(() => {
    void navigate(ROUTE_DEFINITIONS.EMPLEADOS.path);
  }, [navigate]);

  // Generate username from RUT + suffix
  const rutValue = personalFormMethods.watch('rutComplete');
  const generatedUsername = useMemo(() => rutValue ? `${rutValue}${usernameSuffix || ''}` : '', [rutValue, usernameSuffix]);

  // Build field mapping for backend validation error injection (memoized)
  const buildFieldMapping = useMemo(() => ({
    // Personal tab fields
    rutComplete: { tab: 'personal' as const, formInstance: personalFormMethods },
    firstNames: { tab: 'personal' as const, formInstance: personalFormMethods },
    lastName: { tab: 'personal' as const, formInstance: personalFormMethods },
    secondLastName: { tab: 'personal' as const, formInstance: personalFormMethods },
    birthDate: { tab: 'personal' as const, formInstance: personalFormMethods },
    genderCode: { tab: 'personal' as const, formInstance: personalFormMethods },
    maritalStatusId: { tab: 'personal' as const, formInstance: personalFormMethods },
    employmentStatus: { tab: 'personal' as const, formInstance: personalFormMethods },
    password: { tab: 'personal' as const, formInstance: personalFormMethods },
    
    // Contact tab fields
    corporateEmail: { tab: 'contact' as const, formInstance: contactFormMethods },
    personalEmail: { tab: 'contact' as const, formInstance: contactFormMethods },
    companyPhoneNumber: { tab: 'contact' as const, formInstance: contactFormMethods },
    personalPhoneNumber: { tab: 'contact' as const, formInstance: contactFormMethods },
    
    // Address tab fields
    address: { tab: 'address' as const, formInstance: addressFormMethods },
    regionId: { tab: 'address' as const, formInstance: addressFormMethods },
    communeId: { tab: 'address' as const, formInstance: addressFormMethods },
  }), [personalFormMethods, contactFormMethods, addressFormMethods]);

  // Validate all forms and return validation state
  const validateAllForms = useCallback(async () => {
    const [personalValid, contactValid, addressValid] = await Promise.all([
      personalFormMethods.trigger(),
      contactFormMethods.trigger(),
      addressFormMethods.trigger(),
    ]);

    return { personalValid, contactValid, addressValid };
  }, [personalFormMethods, contactFormMethods, addressFormMethods]);

  // Navigate to first tab with validation errors
  const navigateToFirstErrorTab = useCallback((validationState: {
    personalValid: boolean;
    contactValid: boolean;
    addressValid: boolean;
  }) => {
    if (!validationState.personalValid) {
      internalSetActiveTab('personal');
    } else if (!validationState.contactValid) {
      internalSetActiveTab('contact');
    } else if (!validationState.addressValid) {
      internalSetActiveTab('address');
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
    const errorMessage = errorDescription || 'Error al crear el colaborador';
    
    if (errorCode === 'CONFLICT_DUPLICATE_EMPLOYEE') {
      showNotification('error', 'El RUT o correo ya está registrado', 4000);
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
      const { personalValid, contactValid, addressValid } = validationState;

      // If validation failed, show errors and navigate to first error tab
      if (!personalValid || !contactValid || !addressValid) {
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
        ...personalFormMethods.getValues(),
        ...contactFormMethods.getValues(),
        ...addressFormMethods.getValues(),
      } as ValidatedCreateEmployeeFormData;

      // Map form data to transport DTO and call API
      const transportData = mapCreateEmployeeFormToTransport(fullData);
      const response = await employeeService.create(transportData);

      // Handle response
      if (response.success) {
        showNotification('success', 'Colaborador creado exitosamente', 4000);
        void navigate(ROUTE_DEFINITIONS.EMPLEADOS.path);
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
      const errorMessage = 'Error inesperado al crear el colaborador';
      showNotification('error', errorMessage, 4000);
      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  }, [
    navigate,
    showNotification,
    personalFormMethods,
    contactFormMethods,
    addressFormMethods,
    validateAllForms,
    navigateToFirstErrorTab,
    handleBackendValidationError,
    handleBackendError,
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

  const maritalStatusOptions = useMemo(
    () =>
      maritalStatuses.map((status) => ({
        value: String(status.id),
        label: status.description,
      })),
    [maritalStatuses],
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
    genderOptions: GENDERS,
    maritalStatusOptions,
    employmentStatusOptions: EMPLOYMENT_STATUSES,
    regionOptions,
    communeOptions,
    creating,
    usernameSuffix,
    generatedUsername,
    personalForm: {
      register: personalFormMethods.register,
      setValue: personalFormMethods.setValue,
      watch: personalFormMethods.watch,
      errors: personalFormMethods.formState.errors,
      trigger: personalFormMethods.trigger,
    },
    contactForm: {
      register: contactFormMethods.register,
      setValue: contactFormMethods.setValue,
      watch: contactFormMethods.watch,
      errors: contactFormMethods.formState.errors,
      trigger: contactFormMethods.trigger,
    },
    addressForm: {
      register: addressFormMethods.register,
      setValue: addressFormMethods.setValue,
      watch: addressFormMethods.watch,
      errors: addressFormMethods.formState.errors,
      trigger: addressFormMethods.trigger,
    },
  };
}
