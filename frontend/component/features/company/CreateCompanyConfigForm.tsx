import React from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, UseFormTrigger } from 'react-hook-form';
import { LabelInput, ImageUploader } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { Checkbox } from '@/components/ui/inputs/Checkbox';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { IconScout } from '@/components/ui/images/IconScout';
import { FormLayout } from '@/components/layout';
import type { CreateCompanyConfig } from '@/schemas/company/createCompanyForm';
import type { UseCompanyLogoReturn } from '@/hooks/company';
import { useAppSelector } from '@/hooks';


interface CreateCompanyConfigFormProps {
  configForm: {
    register: UseFormRegister<CreateCompanyConfig>;
    setValue: UseFormSetValue<CreateCompanyConfig>;
    watch: UseFormWatch<CreateCompanyConfig>;
    errors: FieldErrors<CreateCompanyConfig>;
    trigger: UseFormTrigger<CreateCompanyConfig>;
  };
  holdingCompanyOptions: { value: string; label: string }[];
  onCancel: () => void;
  onCreate?: () => void;
  creating: boolean;
  onPrevious?: () => void;
  logoHook: UseCompanyLogoReturn;
  onCopySeedAssistance: () => void;
}

export const CreateCompanyConfigForm: React.FC<CreateCompanyConfigFormProps> = ({
  configForm,
  holdingCompanyOptions,
  onCancel,
  onCreate,
  creating,
  onPrevious,
  logoHook,
  onCopySeedAssistance,
}) => {
  const seedAssistance = useAppSelector((state) => state.auth.user?.seedAssistance ?? null);
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const synchronizeWithREX = configForm.watch('synchronizeWithREX');

  return (
    <FormLayout onSubmit={handleSubmit} columns={3} data-testid="create-company-config-form">
      {/* Sección 1: Empresa Padre */}
      <FormLayout.Section title="Empresa Padre">
        <ComboBox
          label="Empresa Padre (Holding)"
          required
          options={holdingCompanyOptions}
          value={configForm.watch('fatherCompanyId') ? String(configForm.watch('fatherCompanyId')) : undefined}
          onChange={(value) => {
            const stringValue = Array.isArray(value) ? value[0] : value;
            const companyIdNumber = stringValue ? parseInt(stringValue, 10) : undefined;
            configForm.setValue('fatherCompanyId', companyIdNumber as number);
          }}
          placeholder="Seleccionar empresa padre"
          color={configForm.errors.fatherCompanyId ? 'error' : 'default'}
          supportingText={configForm.errors.fatherCompanyId?.message}
          data-testid="father-company-selector"
        />
      </FormLayout.Section>

      {/* Sección 2: Parámetros */}
      <FormLayout.Section title="Parámetros">
        <Checkbox
          label="Desvincula empleados con contrato vencido"
          checked={configForm.watch('terminateEmployeesWithExpiredContract')}
          onChange={(checked) => {
            configForm.setValue('terminateEmployeesWithExpiredContract', checked);
          }}
          data-testid="checkbox-terminate-employees"
        />

        <Checkbox
          label="Es empresa EST"
          checked={configForm.watch('estCompanyType') === 'T'}
          onChange={(checked) => {
            configForm.setValue('estCompanyType', checked ? 'T' : null);
          }}
          data-testid="checkbox-est-company"
        />
      </FormLayout.Section>

      {/* Sección 3: Sincronización Rex+ */}
      <FormLayout.Section title="Sincronización Rex+">
        <Checkbox
          label="Sincroniza con Rex"
          checked={synchronizeWithREX}
          onChange={(checked) => {
            configForm.setValue('synchronizeWithREX', checked);
          }}
          data-testid="checkbox-synchronize-rex"
        />

        <Checkbox
          label="Integración de asistencia con REX+"
          checked={configForm.watch('hasAttendanceIntengrationREX')}
          onChange={(checked) => {
            configForm.setValue('hasAttendanceIntengrationREX', checked);
          }}
          data-testid="checkbox-attendance-integration-rex"
        />

        <div aria-hidden="true" className="hidden md:block" />

        {synchronizeWithREX && (
          <>
            <LabelInput
              label="ID REX"
              required
              registration={configForm.register('rexid')}
              hasError={!!configForm.errors.rexid}
              errorMessage={configForm.errors.rexid?.message}
              placeholder="ID de integración REX"
              variant="standard"
              data-testid="rexid-input"
            />

            <LabelInput
              label="URL REX"
              required
              registration={configForm.register('rexurl')}
              hasError={!!configForm.errors.rexurl}
              errorMessage={configForm.errors.rexurl?.message}
              placeholder="https://..."
              variant="standard"
              data-testid="rexurl-input"
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
              data-testid="seed-assistance-input"
            />
          </>
        )}
      </FormLayout.Section>

      {/* Sección 4: Logo de Empresa */}
      <FormLayout.Section title="Logo de Empresa">
        <div className="col-span-1">
          <ImageUploader
            preset="logo"
            currentImageUrl={logoHook.currentLogoUrl || undefined}
            onFileSelect={(file: File) => {
              logoHook.handleFileSelect(file);
            }}
            onCropComplete={(imageBase64: string) => {
              logoHook.handleCropComplete(imageBase64);
            }}
            onRemove={() => {
              logoHook.resetLogo();
            }}
            onError={() => {
              // Error handled by ImageUploader component
            }}
            disabled={creating}
            data-testid="company-logo-uploader"
          />

          {/* Show upload error if exists */}
          {logoHook.uploadError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {logoHook.uploadError}
            </div>
          )}
        </div>
      </FormLayout.Section>

      {/* Footer */}
      <FormLayout.Footer
        cancelButton={
          <PrimaryButton
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="cancel-button"
          >
            Cancelar
          </PrimaryButton>
        }
        secondaryButton={
          <PrimaryButton
            type="button"
            variant="outline"
            onClick={onPrevious}
            data-testid="previous-button"
          >
            Anterior
          </PrimaryButton>
        }
        primaryButton={
          <PrimaryButton
            type="button"
            onClick={onCreate}
            isLoading={creating}
            data-testid="create-button"
          >
            Crear Empresa
          </PrimaryButton>
        }
      />
    </FormLayout>
  );
};
