/**
 * Company Profile Config Form
 * Editable form for company configuration (Tab 2)
 * Sections: Parámetros, Sincronización Rex+
 */

import React from 'react';
import { FormLayout } from '@/components/layout/FormLayout';
import { Checkbox } from '@/components/ui/inputs/Checkbox';
import { LabelInput, ImageUploader } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { IconScout } from '@/components/ui/images/IconScout';
import type { CompanyProfile } from '@/api/domains/company';
import type { UseCompanyLogoReturn } from '@/hooks/company';
import { useAppSelector } from '@/hooks';


interface CompanyProfileConfigFormProps {
  profile: CompanyProfile | null;
  onCancel: () => void;
  logoHook: UseCompanyLogoReturn;
  savingConfig: boolean;
  onCopySeedAssistance: () => void;
  configForm: {
    register: any;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: any;
    watch: any;
    errors: any;
    isSubmitting: boolean;
  };
}

export const CompanyProfileConfigForm: React.FC<CompanyProfileConfigFormProps> = ({
  profile,
  onCancel,
  logoHook,
  savingConfig,
  onCopySeedAssistance,
  configForm,
}) => {
  const seedAssistance = useAppSelector((state) => state.auth.user?.seedAssistance ?? null);
  
  if (!profile) return null;

  const { register, handleSubmit, setValue, watch, errors } = configForm;

  // Watch for controlled inputs
  const terminateExpiredContracts = watch('terminateExpiredContracts');
  const syncWithRex = watch('syncWithRex');
  const estType = watch('estType');

  return (
    <FormLayout onSubmit={handleSubmit} columns={4} data-testid="company-profile-config-form">
      {/* Sección 1: Parámetros */}
      <FormLayout.Section title="Parámetros">
        <Checkbox
          label="Desvincula empleados con contrato vencido"
          checked={terminateExpiredContracts}
          onChange={(checked) => setValue('terminateExpiredContracts', checked)}
          data-testid="checkbox-terminate-expired-contracts"
        />
        <Checkbox
          label="Es empresa EST"
          checked={estType === 'T'}
          onChange={(checked) => setValue('estType', checked ? 'T' : null, { shouldDirty: true })}
          data-testid="checkbox-est-company"
        />
      </FormLayout.Section>

      {/* Sección 2: Sincronización Rex+ */}
      <FormLayout.Section title="Sincronización Rex+">
        <Checkbox
          label="Sincroniza con Rex"
          checked={syncWithRex}
          onChange={(checked) => setValue('syncWithRex', checked)}
          data-testid="checkbox-sync-with-rex"
        />

        {syncWithRex && (
          <>
            <LabelInput
              label="ID"
              registration={register('rexId')}
              variant="standard"
              hasError={!!errors.rexId}
              errorMessage={errors.rexId?.message}
              data-testid="input-rex-id"
            />
            <LabelInput
              label="URL REX"
              registration={register('rexUrl')}
              variant="standard"
              hasError={!!errors.rexUrl}
              errorMessage={errors.rexUrl?.message}
              data-testid="input-rex-url"
            />
            <LabelInput
              label="Token asistencia"
              value={seedAssistance || 'No disponible'}
              variant="standard"
              disabled
              iconRight={
                seedAssistance ? (
                  <PrimaryButton
                    variant="ghost"
                    size="sm"
                    onClick={onCopySeedAssistance}
                    className="relative !min-w-0 !w-auto"
                    data-testid="btn-copy-seed-assistance"
                  >
                    <IconScout name="copy" />
                  </PrimaryButton>
                ) : null
              }
              data-testid="input-seed-assistance"
            />
          </>
        )}
      </FormLayout.Section>

      {/* Sección 3: Logo de Empresa */}
      <FormLayout.Section title="Logo de Empresa">
        <div className="col-span-1">
          <ImageUploader
            preset="logo"
            currentImageUrl={logoHook.currentLogoUrl ?? undefined}
            onFileSelect={logoHook.handleFileSelect}
            onCropComplete={logoHook.handleCropComplete}
            onError={() => {}}
            data-testid="company-logo-uploader"
          />
        </div>
      </FormLayout.Section>

      {/* Footer */}
      <FormLayout.Footer
        cancelButton={
          <PrimaryButton variant="outline" onClick={onCancel} data-testid="btn-cancel">
            Cancelar
          </PrimaryButton>
        }
        primaryButton={
          <PrimaryButton type="submit" isLoading={savingConfig} data-testid="btn-save">
            Guardar
          </PrimaryButton>
        }
      />
    </FormLayout>
  );
};

export default CompanyProfileConfigForm;
