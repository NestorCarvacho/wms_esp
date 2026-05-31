import React from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, UseFormTrigger } from 'react-hook-form';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormLayout } from '@/components/layout';
import type { CreateCompanyInfo } from '@/schemas/company/createCompanyForm';
import { normalizeNumericSelectValue } from '@/utils/formHelpers';


interface CreateCompanyInfoFormProps {
  infoForm: {
    register: UseFormRegister<CreateCompanyInfo>;
    setValue: UseFormSetValue<CreateCompanyInfo>;
    watch: UseFormWatch<CreateCompanyInfo>;
    errors: FieldErrors<CreateCompanyInfo>;
    trigger: UseFormTrigger<CreateCompanyInfo>;
  };
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  onCancel: () => void;
  onNext?: () => void;
}

export const CreateCompanyInfoForm: React.FC<CreateCompanyInfoFormProps> = ({
  infoForm,
  regionOptions,
  communeOptions,
  onCancel,
  onNext,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  // Format RUT while typing: remove dots, allow only digits, hyphen, and K/k
  const handleRutChange = (value: string) => {
    // Remove dots and spaces
    let cleaned = value.replace(/\./g, '').replace(/\s/g, '');

    // Convert to uppercase for consistency
    cleaned = cleaned.toUpperCase();

    // Only allow digits, hyphen, and K
    cleaned = cleaned.replace(/[^0-9-K]/g, '');

    // Remove all hyphens first to normalize
    const withoutHyphens = cleaned.replace(/-/g, '');

    // If empty or only one character, don't format
    if (withoutHyphens.length <= 1) {
      infoForm.setValue('rutComplete', withoutHyphens);
      return;
    }

    // Auto-add hyphen before last character if not present
    const bodyRut = withoutHyphens.slice(0, -1);
    const dvRut = withoutHyphens.slice(-1);
    const formatted = `${bodyRut}-${dvRut}`;

    infoForm.setValue('rutComplete', formatted);
  };

  return (
    <FormLayout onSubmit={handleSubmit} columns={4} data-testid="create-company-info-form">
      {/* Sección 1: Datos de Empresa */}
      <FormLayout.Section title="Datos de Empresa">
        <LabelInput
          label="RUT Empresa"
          required
          hasError={!!infoForm.errors.rutComplete}
          errorMessage={infoForm.errors.rutComplete?.message}
          placeholder="12345678-9"
          value={infoForm.watch('rutComplete')}
          onChange={handleRutChange}
          variant="standard"
          data-testid="company-rut-input"
        />

        <LabelInput
          label="Razón Social"
          required
          registration={infoForm.register('companyName')}
          hasError={!!infoForm.errors.companyName}
          errorMessage={infoForm.errors.companyName?.message}
          placeholder="Empresa S.A."
          variant="standard"
          data-testid="company-name-input"
        />

        <LabelInput
          label="Nombre de Fantasía"
          registration={infoForm.register('companyNameFantasy')}
          hasError={!!infoForm.errors.companyNameFantasy}
          errorMessage={infoForm.errors.companyNameFantasy?.message}
          placeholder="Mi Empresa"
          variant="standard"
          data-testid="company-name-fantasy-input"
        />
      </FormLayout.Section>

      {/* Sección 2: Dirección de Empresa */}
      <FormLayout.Section title="Dirección de Empresa">
        <LabelInput
          label="Nombre de calle"
          required
          registration={infoForm.register('companyAddress')}
          hasError={!!infoForm.errors.companyAddress}
          errorMessage={infoForm.errors.companyAddress?.message}
          placeholder="Av. Principal"
          variant="standard"
          data-testid="company-address-input"
        />

        <LabelInput
          label="Numeración"
          required
          registration={infoForm.register('companyAddressNumber')}
          hasError={!!infoForm.errors.companyAddressNumber}
          errorMessage={infoForm.errors.companyAddressNumber?.message}
          placeholder="123, Of. 45"
          variant="standard"
          data-testid="company-address-number-input"
        />

        <Selector
          label="Región"
          required
          options={regionOptions}
          value={infoForm.watch('regionId') ? String(infoForm.watch('regionId')) : undefined}
          onChange={(value) => {
            const regionIdNumber = normalizeNumericSelectValue(value);
            infoForm.setValue('regionId', regionIdNumber as number);
          }}
          placeholder="Seleccionar región"
          color={infoForm.errors.regionId ? 'error' : 'default'}
          supportingText={infoForm.errors.regionId?.message}
          data-testid="region-selector"
        />

        <Selector
          label="Comuna"
          required
          options={communeOptions}
          value={infoForm.watch('communeId') ? String(infoForm.watch('communeId')) : undefined}
          onChange={(value) => {
            const communeIdNumber = normalizeNumericSelectValue(value);
            infoForm.setValue('communeId', communeIdNumber as number);
          }}
          placeholder="Seleccionar comuna"
          disabled={!infoForm.watch('regionId')}
          color={infoForm.errors.communeId ? 'error' : 'default'}
          supportingText={infoForm.errors.communeId?.message}
          data-testid="commune-selector"
        />
      </FormLayout.Section>

      {/* Sección 3: Contacto de Empresa */}
      <FormLayout.Section title="Contacto de Empresa">
        <LabelInput
          label="Nombre"
          required
          registration={infoForm.register('namePersonContact')}
          hasError={!!infoForm.errors.namePersonContact}
          errorMessage={infoForm.errors.namePersonContact?.message}
          placeholder="Juan Pérez"
          variant="standard"
          data-testid="contact-name-input"
        />

        <LabelInput
          label="Correo"
          required
          type="email"
          registration={infoForm.register('emailPersonContact')}
          hasError={!!infoForm.errors.emailPersonContact}
          errorMessage={infoForm.errors.emailPersonContact?.message}
          placeholder="contacto@empresa.cl"
          variant="standard"
          data-testid="contact-email-input"
        />

        <LabelInput
          label="Teléfono"
          required
          registration={infoForm.register('telephonePersonContact')}
          hasError={!!infoForm.errors.telephonePersonContact}
          errorMessage={infoForm.errors.telephonePersonContact?.message}
          placeholder="+56 9 1234 5678"
          variant="standard"
          data-testid="contact-phone-input"
        />
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
        primaryButton={
          <PrimaryButton
            type="button"
            onClick={onNext}
            data-testid="next-button"
          >
            Siguiente
          </PrimaryButton>
        }
      />
    </FormLayout>
  );
};
