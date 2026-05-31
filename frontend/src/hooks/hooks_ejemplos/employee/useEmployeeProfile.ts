import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ROUTE_DEFINITIONS } from '@/routes';
import { employeeGet, employeeUpdate, type EmployeeProfile } from '@/api/domains/employee';
import type { Region, Commune } from '@/api/domains/geography';
import type { MaritalStatus } from '@/api/domains/catalog';
import { useUI } from '@/hooks';
import { processBackendValidationErrors } from '@/utils/formValidationErrors';
import {
  updateEmployeePersonalDataSchema,
  updateEmployeeContactDataSchema,
  updateEmployeeAddressDataSchema,
  type UpdateEmployeePersonalData,
  type UpdateEmployeeContactData,
  type UpdateEmployeeAddressData,
} from '@/schemas/employee';


interface UseEmployeeProfileResult {
  loading: boolean;
  error: string | null;
  profile: EmployeeProfile | null;
  activeTab: 'personal' | 'contact' | 'address';
  setActiveTab: (tab: 'personal' | 'contact' | 'address') => void;
  handleCancel: () => void;
  genderOptions: { value: string; label: string }[];
  maritalStatusOptions: { value: string; label: string }[];
  employmentStatusOptions: { value: string; label: string }[];
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  // Personal data form
  personalForm: {
    register: ReturnType<typeof useForm<UpdateEmployeePersonalData>>['register'];
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: ReturnType<typeof useForm<UpdateEmployeePersonalData>>['setValue'];
    watch: ReturnType<typeof useForm<UpdateEmployeePersonalData>>['watch'];
    errors: ReturnType<typeof useForm<UpdateEmployeePersonalData>>['formState']['errors'];
    isSubmitting: boolean;
  };
  // Contact data form
  contactForm: {
    register: ReturnType<typeof useForm<UpdateEmployeeContactData>>['register'];
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    errors: ReturnType<typeof useForm<UpdateEmployeeContactData>>['formState']['errors'];
    isSubmitting: boolean;
  };
  // Address data form
  addressForm: {
    register: ReturnType<typeof useForm<UpdateEmployeeAddressData>>['register'];
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: ReturnType<typeof useForm<UpdateEmployeeAddressData>>['setValue'];
    watch: ReturnType<typeof useForm<UpdateEmployeeAddressData>>['watch'];
    errors: ReturnType<typeof useForm<UpdateEmployeeAddressData>>['formState']['errors'];
    isSubmitting: boolean;
  };
}

// Gender options (M/F as per backend)
const GENDERS = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
];

// Employment status options (V=Vigente, N=No Vigente)
const EMPLOYMENT_STATUSES = [
  { value: 'V', label: 'Vigente' },
  { value: 'N', label: 'No Vigente' },
];

export function useEmployeeProfile(): UseEmployeeProfileResult {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [activeTab, internalSetActiveTab] = useState<'personal' | 'contact' | 'address'>('personal');

  // Catalog states
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);

  // Load profile on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!employeeId) {
        setError('Identificador inválido');
        setLoading(false);
        return;
      }
      const id = Number(employeeId);
      if (Number.isNaN(id)) {
        setError('Identificador inválido');
        setLoading(false);
        return;
      }
      const response = await employeeGet.getProfile(id);
      if (!mounted) return;
      if (!response.success || !response.data) {
        setError(response.error?.description || 'No se pudo cargar el perfil');
        setLoading(false);
        return;
      }
      setProfile(response.data);
      setLoading(false);
    };
    void load();
    return () => { mounted = false; };
  }, [employeeId]);

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
        if (mounted && maritalStatusResponse.success && maritalStatusResponse.data) {
          setMaritalStatuses(maritalStatusResponse.data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void loadCatalogs();
    return () => { mounted = false; };
  }, []);

  const setActiveTab = useCallback((tab: 'personal' | 'contact' | 'address') => {
    internalSetActiveTab(tab);
  }, []);

  const handleCancel = useCallback(() => {
    void navigate(ROUTE_DEFINITIONS.EMPLEADOS.path);
  }, [navigate]);

  // Personal data form
  const personalFormMethods = useForm<UpdateEmployeePersonalData>({
    resolver: zodResolver(updateEmployeePersonalDataSchema),
    mode: 'onBlur',
    defaultValues: profile ? {
      id: profile.id,
      firstNames: profile.firstNames,
      lastName: profile.lastName,
      secondLastName: profile.secondLastName || '',
      birthDate: profile.birthDate || '',
      genderCode: profile.genderCode || '',
      maritalStatusId: profile.maritalStatusId || 0,
      employmentStatus: profile.employmentStatus || '',
    } : undefined,
  });

  // Contact data form
  const contactFormMethods = useForm<UpdateEmployeeContactData>({
    resolver: zodResolver(updateEmployeeContactDataSchema),
    mode: 'onBlur',
    defaultValues: profile ? {
      id: profile.id,
      corporateEmail: profile.corporateEmail,
      personalEmail: profile.personalEmail,
      companyPhoneNumber: profile.companyPhoneNumber || '',
      personalPhoneNumber: profile.personalPhoneNumber || '',
    } : undefined,
  });

  // Address data form
  const addressFormMethods = useForm<UpdateEmployeeAddressData>({
    resolver: zodResolver(updateEmployeeAddressDataSchema),
    mode: 'onBlur',
    defaultValues: profile ? {
      id: profile.id,
      address: profile.address || '',
      regionId: profile.regionId || null,
      communeId: profile.communeId || null,
    } : undefined,
  });

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
  }, [regionIdValue, addressFormMethods]);

  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      personalFormMethods.setValue('id', profile.id);
      personalFormMethods.setValue('firstNames', profile.firstNames);
      personalFormMethods.setValue('lastName', profile.lastName);
      personalFormMethods.setValue('secondLastName', profile.secondLastName || '');
      personalFormMethods.setValue('birthDate', profile.birthDate || '');
      personalFormMethods.setValue('genderCode', profile.genderCode || '');
      personalFormMethods.setValue('maritalStatusId', profile.maritalStatusId || 0);
      personalFormMethods.setValue('employmentStatus', profile.employmentStatus || '');

      contactFormMethods.setValue('id', profile.id);
      contactFormMethods.setValue('corporateEmail', profile.corporateEmail);
      contactFormMethods.setValue('personalEmail', profile.personalEmail);
      contactFormMethods.setValue('companyPhoneNumber', profile.companyPhoneNumber || '');
      contactFormMethods.setValue('personalPhoneNumber', profile.personalPhoneNumber || '');

      addressFormMethods.setValue('id', profile.id);
      addressFormMethods.setValue('address', profile.address || '');
      addressFormMethods.setValue('regionId', profile.regionId || null);
      addressFormMethods.setValue('communeId', profile.communeId || null);
    }
  }, [profile, personalFormMethods, contactFormMethods, addressFormMethods]);

  // Build field mapping for backend validation error injection (memoized)
  const buildFieldMapping = useMemo(() => ({
    // Personal tab fields
    firstNames: { tab: 'personal' as const, formInstance: personalFormMethods },
    lastName: { tab: 'personal' as const, formInstance: personalFormMethods },
    secondLastName: { tab: 'personal' as const, formInstance: personalFormMethods },
    birthDate: { tab: 'personal' as const, formInstance: personalFormMethods },
    genderCode: { tab: 'personal' as const, formInstance: personalFormMethods },
    maritalStatusId: { tab: 'personal' as const, formInstance: personalFormMethods },
    employmentStatus: { tab: 'personal' as const, formInstance: personalFormMethods },
    
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

  // Handle backend validation errors
  const handleBackendValidationError = useCallback((
    validationErrors: Array<{ fieldName: string; errorMessage: string }>,
  ) => {
    processBackendValidationErrors(
      validationErrors,
      buildFieldMapping,
      setActiveTab,
    );
    showNotification('error', 'Corrige los errores de validación', 4000);
  }, [buildFieldMapping, setActiveTab, showNotification]);

  // Unified update handler
  const handleUpdate = useCallback(async (employeeProfile: EmployeeProfile) => {
    try {
      const response = await employeeUpdate.update(employeeProfile);
      
      if (response.success) {
        showNotification('success', 'Empleado actualizado correctamente', 4000);
        void navigate(ROUTE_DEFINITIONS.EMPLEADOS.path);
      } else {
        if (response.error?.code === 'VALIDATION_ERROR' && response.error.validationErrors) {
          handleBackendValidationError(response.error.validationErrors);
          return;
        }
        const errorMessage = response.error?.description || 'Error al actualizar empleado';
        showNotification('error', errorMessage, 4000);
      }
    } catch {
      showNotification('error', 'Error inesperado al actualizar empleado', 4000);
    }
  }, [navigate, showNotification, handleBackendValidationError]);

  // Single memoized cross-validated submit handler (used by all tabs)
  const handleCrossValidatedSubmit = useCallback(
    async (event?: React.BaseSyntheticEvent) => {
      event?.preventDefault();
        
      // Validate ALL forms to detect errors in any tab
      const [personalValid, contactValid, addressValid] = await Promise.all([
        personalFormMethods.trigger(),
        contactFormMethods.trigger(),
        addressFormMethods.trigger(),
      ]);
        
      // Check each form and redirect to first error tab
      const validationChecks = [
        { valid: personalValid, tab: 'personal' as const, label: 'Datos Personales' },
        { valid: contactValid, tab: 'contact' as const, label: 'Datos de Contacto' },
        { valid: addressValid, tab: 'address' as const, label: 'Dirección' },
      ];
        
      for (const check of validationChecks) {
        if (!check.valid) {
          internalSetActiveTab(check.tab);
          showNotification('error', `Corrige los errores de validación en ${check.label}`, 4000);
          return;
        }
      }
        
      // Get current values from ALL forms
      const personalData = personalFormMethods.getValues();
      const contactData = contactFormMethods.getValues();
      const addressData = addressFormMethods.getValues();
      
      // Merge with profile to create complete updated profile
      const updatedProfile: EmployeeProfile = {
        ...profile!,
        ...personalData,
        ...contactData,
        ...addressData,
      };
        
      // Submit with complete updated profile
      await handleUpdate(updatedProfile);
    },
    [
      personalFormMethods,
      contactFormMethods,
      addressFormMethods,
      handleUpdate,
      profile,
      showNotification,
    ],
  );

  // All tabs use the same handler (avoid unnecessary function allocations)
  const handlePersonalSubmit = handleCrossValidatedSubmit;
  const handleContactSubmit = handleCrossValidatedSubmit;
  const handleAddressSubmit = handleCrossValidatedSubmit;

  // Transform to selector options
  const regionOptions = useMemo(
    () => regions.map(region => ({ value: String(region.id), label: region.name })),
    [regions],
  );

  const communeOptions = useMemo(
    () => communes.map(commune => ({ value: String(commune.id), label: commune.name })),
    [communes],
  );

  const maritalStatusOptions = useMemo(
    () => maritalStatuses.map(status => ({ value: String(status.id), label: status.description })),
    [maritalStatuses],
  );

  return {
    loading,
    error,
    profile,
    activeTab,
    setActiveTab,
    handleCancel,
    genderOptions: GENDERS,
    maritalStatusOptions,
    employmentStatusOptions: EMPLOYMENT_STATUSES,
    regionOptions,
    communeOptions,
    personalForm: {
      register: personalFormMethods.register,
      handleSubmit: handlePersonalSubmit,
      setValue: personalFormMethods.setValue,
      watch: personalFormMethods.watch,
      errors: personalFormMethods.formState.errors,
      isSubmitting: personalFormMethods.formState.isSubmitting,
    },
    contactForm: {
      register: contactFormMethods.register,
      handleSubmit: handleContactSubmit,
      errors: contactFormMethods.formState.errors,
      isSubmitting: contactFormMethods.formState.isSubmitting,
    },
    addressForm: {
      register: addressFormMethods.register,
      handleSubmit: handleAddressSubmit,
      setValue: addressFormMethods.setValue,
      watch: addressFormMethods.watch,
      errors: addressFormMethods.formState.errors,
      isSubmitting: addressFormMethods.formState.isSubmitting,
    },
  };
}

export default useEmployeeProfile;
