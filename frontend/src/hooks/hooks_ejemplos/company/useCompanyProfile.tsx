/**
 * useCompanyProfile Hook
 * Main hook for company profile page - manages data fetching, forms, and tab state
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ROUTE_DEFINITIONS } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAppSelector , useUI } from '@/hooks';
import { companyService, type CompanyProfile } from '@/api/domains/company';
import { type Region, type Commune } from '@/api/domains/geography';
import { useCompanyLogo, type UseCompanyLogoReturn } from '@/hooks/company';
import {
  updateCompanyInfoSchema,
  updateCompanyConfigSchema,
  type UpdateCompanyInfo,
  type UpdateCompanyConfig,
} from '@/schemas/company';
import { processBackendValidationErrors } from '@/utils/formValidationErrors';


type TabId = 'info' | 'config';

interface UseCompanyProfileResult {
  loading: boolean;
  error: string | null;
  profile: CompanyProfile | null;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  handleCancel: () => void;
  handleCopySeedAssistance: () => void;
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  logoHook: UseCompanyLogoReturn;
  savingInfo: boolean;
  savingConfig: boolean;
  // Info form
  infoForm: {
    register: ReturnType<typeof useForm<UpdateCompanyInfo>>['register'];
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: ReturnType<typeof useForm<UpdateCompanyInfo>>['setValue'];
    watch: ReturnType<typeof useForm<UpdateCompanyInfo>>['watch'];
    errors: ReturnType<typeof useForm<UpdateCompanyInfo>>['formState']['errors'];
    isSubmitting: boolean;
  };
  // Config form
  configForm: {
    register: ReturnType<typeof useForm<UpdateCompanyConfig>>['register'];
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: ReturnType<typeof useForm<UpdateCompanyConfig>>['setValue'];
    watch: ReturnType<typeof useForm<UpdateCompanyConfig>>['watch'];
    errors: ReturnType<typeof useForm<UpdateCompanyConfig>>['formState']['errors'];
    isSubmitting: boolean;
  };
}

/**
 * Hook for company profile operations
 * Loads company data by ID from URL params, manages forms and catalogs
 */
export function useCompanyProfile(): UseCompanyProfileResult {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const { t: translate } = useTranslation();
  const seedAssistance = useAppSelector((state) => state.auth.user?.seedAssistance ?? null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [activeTab, internalSetActiveTab] = useState<TabId>('info');
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const setActiveTab = useCallback((tab: TabId) => {
    internalSetActiveTab(tab);
  }, []);

  // Catalog states
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);

  // Logo management hook
  const logoHook = useCompanyLogo({
    companyId: profile?.id,
    currentLogoUrl: profile?.logoUrl || null,
    onLogoUpdated: (logoUrl: string) => {
      // Update profile with new logo URL
      if (profile) {
        setProfile({ ...profile, logoUrl });
      }
      showNotification('success', translate('company:logo.success.uploaded'), 4000);
    },
    onError: (errorMessage: string) => {
      showNotification('error', errorMessage, 4000);
    },
  });

  // Load company profile
  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!companyId || Number.isNaN(Number(companyId))) {
        setError('ID de empresa inválido');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await companyService.getById(Number(companyId));

      if (!mounted) return;

      if (!response.success || !response.data) {
        const errorMessage =
          response.error?.description || 'No se pudo cargar el perfil de la empresa';
        setError(errorMessage);
        showNotification('error', errorMessage, 5000);
        setLoading(false);
        return;
      }

      setProfile(response.data);
      setLoading(false);
    };

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, [companyId, showNotification]);

  // Load regions on mount
  useEffect(() => {
    let mounted = true;
    const loadRegions = async () => {
      setLoading(true);
      try {
        const regionsResponse = await companyService.getRegions('CL');
        if (mounted && regionsResponse.success && regionsResponse.data) {
          setRegions(regionsResponse.data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void loadRegions();
    return () => {
      mounted = false;
    };
  }, []);

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

  // Info form
  const infoFormMethods = useForm<UpdateCompanyInfo>({
    resolver: zodResolver(updateCompanyInfoSchema),
    mode: 'onBlur',
    defaultValues: profile
      ? {
        id: profile.id,
        rut: profile.rut,
        dv: profile.dv,
        name: profile.name,
        fantasyName: profile.fantasyName,
        address: profile.address,
        addressNumber: profile.addressNumber,
        regionId: profile.regionId,
        communeId: profile.communeId,
        contactName: profile.contactName,
        contactEmail: profile.contactEmail,
        contactPhone: profile.contactPhone,
      }
      : undefined,
  });

  // Config form
  const configFormMethods = useForm<UpdateCompanyConfig>({
    resolver: zodResolver(updateCompanyConfigSchema),
    mode: 'onBlur',
    defaultValues: profile
      ? {
        id: profile.id,
        terminateExpiredContracts: profile.terminateExpiredContracts,
        estType: profile.estType,
        syncWithRex: profile.syncWithRex,
        rexId: profile.rexId,
        rexUrl: profile.rexUrl,
      }
      : undefined,
  });

  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      infoFormMethods.setValue('id', profile.id);
      infoFormMethods.setValue('rut', profile.rut);
      infoFormMethods.setValue('dv', profile.dv);
      infoFormMethods.setValue('name', profile.name);
      infoFormMethods.setValue('fantasyName', profile.fantasyName);
      infoFormMethods.setValue('address', profile.address);
      infoFormMethods.setValue('addressNumber', profile.addressNumber);
      infoFormMethods.setValue('regionId', profile.regionId);
      infoFormMethods.setValue('communeId', profile.communeId);
      infoFormMethods.setValue('contactName', profile.contactName);
      infoFormMethods.setValue('contactEmail', profile.contactEmail);
      infoFormMethods.setValue('contactPhone', profile.contactPhone);

      configFormMethods.setValue('id', profile.id);
      configFormMethods.setValue('terminateExpiredContracts', profile.terminateExpiredContracts);
      configFormMethods.setValue('estType', profile.estType, { shouldValidate: false });
      configFormMethods.setValue('syncWithRex', profile.syncWithRex);
      configFormMethods.setValue('rexId', profile.rexId);
      configFormMethods.setValue('rexUrl', profile.rexUrl);
    }
  }, [profile, infoFormMethods, configFormMethods]);

  // Load communes when region changes (watch form value, not profile)
  const regionIdValue = infoFormMethods.watch('regionId');

  useEffect(() => {
    let mounted = true;
    const loadCommunes = async () => {
      if (!regionIdValue) {
        setCommunes([]);
        return;
      }

      setLoading(true);
      try {
        const communesResponse = await companyService.getCommunes(regionIdValue);
        if (mounted && communesResponse.success && communesResponse.data) {
          setCommunes(communesResponse.data);
        } else if (mounted) {
          setCommunes([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void loadCommunes();
    return () => {
      mounted = false;
    };
  }, [regionIdValue]);

  // Build field mapping for backend validation error injection (memoized)
  const buildFieldMapping = useMemo(() => ({
    // Info tab fields
    id: { tab: 'info' as const, formInstance: infoFormMethods },
    rut: { tab: 'info' as const, formInstance: infoFormMethods },
    dv: { tab: 'info' as const, formInstance: infoFormMethods },
    name: { tab: 'info' as const, formInstance: infoFormMethods },
    fantasyName: { tab: 'info' as const, formInstance: infoFormMethods },
    address: { tab: 'info' as const, formInstance: infoFormMethods },
    addressNumber: { tab: 'info' as const, formInstance: infoFormMethods },
    regionId: { tab: 'info' as const, formInstance: infoFormMethods },
    communeId: { tab: 'info' as const, formInstance: infoFormMethods },
    contactName: { tab: 'info' as const, formInstance: infoFormMethods },
    contactEmail: { tab: 'info' as const, formInstance: infoFormMethods },
    contactPhone: { tab: 'info' as const, formInstance: infoFormMethods },
    
    // Config tab fields
    terminateExpiredContracts: { tab: 'config' as const, formInstance: configFormMethods },
    estType: { tab: 'config' as const, formInstance: configFormMethods },
    syncWithRex: { tab: 'config' as const, formInstance: configFormMethods },
    rexId: { tab: 'config' as const, formInstance: configFormMethods },
    rexUrl: { tab: 'config' as const, formInstance: configFormMethods },
  }), [infoFormMethods, configFormMethods]);

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

  const handleSaveInfo = useCallback(
    async (data: UpdateCompanyInfo) => {
      if (!profile) return;
      
      setSavingInfo(true);
      try {
        const response = await companyService.updateInfo({
          ...profile,
          ...data,
        });

        if (response.success) {
          // If logo was cropped, attempt to upload it
          if (logoHook.croppedLogoUrl) {
            const logoResult = await companyService.updateLogo(
              profile.id,
              logoHook.croppedLogoUrl,
            );

            if (!logoResult.success) {
              // Logo upload failed, but info was updated - show warning
              showNotification(
                'warning',
                translate('company:messages.logoUploadWarning', { 
                  error: logoResult.error || translate('company:logo.errors.unknownError'), 
                }),
                5000,
              );
            }
          }

          // Company info updated successfully - show success notification
          showNotification('success', 'Información actualizada correctamente', 4000);
          void navigate(ROUTE_DEFINITIONS.EMPRESAS.path);
        } else {
          // Handle backend validation errors
          if (response.error?.code === 'VALIDATION_ERROR' && response.error.validationErrors) {
            handleBackendValidationError(response.error.validationErrors);
            return;
          }

          showNotification(
            'error',
            response.error?.description || 'Error al actualizar información',
            4000,
          );
        }
      } catch {
        showNotification('error', 'Error inesperado al guardar', 4000);
      } finally {
        setSavingInfo(false);
      }
    },
    [translate, profile, navigate, showNotification, handleBackendValidationError, logoHook],
  );

  const handleSaveConfig = useCallback(
    async (data: UpdateCompanyConfig) => {
      if (!profile) return;
      
      setSavingConfig(true);
      try {
        const response = await companyService.updateConfig({
          ...profile,
          ...data,
        });

        if (response.success) {
          // If logo was cropped, attempt to upload it
          if (logoHook.croppedLogoUrl) {
            const logoResult = await companyService.updateLogo(
              profile.id,
              logoHook.croppedLogoUrl,
            );

            if (!logoResult.success) {
              // Logo upload failed, but config was updated - show warning
              showNotification(
                'warning',
                translate('company:messages.logoUploadWarning', { 
                  error: logoResult.error || translate('company:logo.errors.unknownError'), 
                }),
                5000,
              );
            }
          }

          // Company config updated successfully - show success notification
          showNotification('success', 'Configuración actualizada correctamente', 4000);
          void navigate(ROUTE_DEFINITIONS.EMPRESAS.path);
        } else {
          // Handle backend validation errors
          if (response.error?.code === 'VALIDATION_ERROR' && response.error.validationErrors) {
            handleBackendValidationError(response.error.validationErrors);
            return;
          }

          showNotification(
            'error',
            response.error?.description || 'Error al actualizar configuración',
            4000,
          );
        }
      } catch {
        showNotification('error', 'Error inesperado al guardar', 4000);
      } finally {
        setSavingConfig(false);
      }
    },
    [translate, profile, navigate, showNotification, handleBackendValidationError, logoHook],
  );

  // Wrapped submit handlers that validate ALL forms and redirect to error tab
  const handleInfoSubmit = useCallback(
    async (event?: React.BaseSyntheticEvent) => {
      event?.preventDefault();
      
      // Validate ALL forms to detect errors in any tab
      const [infoValid, configValid] = await Promise.all([
        infoFormMethods.trigger(),
        configFormMethods.trigger(),
      ]);
      
      // If there are errors in ANY form, redirect to first error tab
      if (!infoValid) {
        internalSetActiveTab('info');
        showNotification('error', 'Corrige los errores de validación en la pestaña Información', 4000);
        return;
      }
      
      if (!configValid) {
        internalSetActiveTab('config');
        showNotification('error', 'Corrige los errores de validación en la pestaña Configuración', 4000);
        return;
      }
      
      // If all valid, call the actual submit handler
      const data = infoFormMethods.getValues();
      await handleSaveInfo(data);
    },
    [infoFormMethods, configFormMethods, handleSaveInfo, showNotification],
  );

  const handleConfigSubmit = useCallback(
    async (event?: React.BaseSyntheticEvent) => {
      event?.preventDefault();
      
      // Validate ALL forms to detect errors in any tab
      const [infoValid, configValid] = await Promise.all([
        infoFormMethods.trigger(),
        configFormMethods.trigger(),
      ]);
      
      // If there are errors in ANY form, redirect to first error tab
      if (!infoValid) {
        internalSetActiveTab('info');
        showNotification('error', 'Corrige los errores de validación en la pestaña Información', 4000);
        return;
      }
      
      if (!configValid) {
        internalSetActiveTab('config');
        showNotification('error', 'Corrige los errores de validación en la pestaña Configuración', 4000);
        return;
      }
      
      // If all valid, call the actual submit handler
      const data = configFormMethods.getValues();
      await handleSaveConfig(data);
    },
    [infoFormMethods, configFormMethods, handleSaveConfig, showNotification],
  );

  // Transform to selector options
  const regionOptions = useMemo(
    () => regions.map((region) => ({ value: String(region.id), label: region.name })),
    [regions],
  );

  const communeOptions = useMemo(
    () => communes.map((commune) => ({ value: String(commune.id), label: commune.name })),
    [communes],
  );

  return {
    loading,
    error,
    profile,
    activeTab,
    setActiveTab,
    handleCancel,
    handleCopySeedAssistance,
    regionOptions,
    communeOptions,
    logoHook,
    savingInfo,
    savingConfig,
    infoForm: {
      register: infoFormMethods.register,
      handleSubmit: handleInfoSubmit,
      setValue: infoFormMethods.setValue,
      watch: infoFormMethods.watch,
      errors: infoFormMethods.formState.errors,
      isSubmitting: infoFormMethods.formState.isSubmitting,
    },
    configForm: {
      register: configFormMethods.register,
      handleSubmit: handleConfigSubmit,
      setValue: configFormMethods.setValue,
      watch: configFormMethods.watch,
      errors: configFormMethods.formState.errors,
      isSubmitting: configFormMethods.formState.isSubmitting,
    },
  };
}

export default useCompanyProfile;
