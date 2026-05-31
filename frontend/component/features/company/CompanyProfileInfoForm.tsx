/**
 * Company Profile Info Form
 * Editable form for company information (Tab 1)
 * Sections: Datos de Empresa, Dirección de Empresa, Contacto de Empresa
 */

import React from 'react';
import { FormLayout } from '@/components/layout/FormLayout';
import { LabelInput } from '@/components/ui/inputs/LabelInput';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { formatRut } from '@/utils';
import type { CompanyProfile } from '@/api/domains/company';
import { normalizeNumericSelectValue } from '@/utils/formHelpers';


interface CompanyProfileInfoFormProps {
  profile: CompanyProfile | null;
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  onCancel: () => void;
  savingInfo: boolean;
  infoForm: {
    register: any;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: any;
    watch: any;
    errors: any;
    isSubmitting: boolean;
  };
}

export const CompanyProfileInfoForm: React.FC<CompanyProfileInfoFormProps> = ({
  profile,
  regionOptions,
  communeOptions,
  onCancel,
  savingInfo,
  infoForm,
}) => {
  const { register, handleSubmit, setValue, watch, errors } = infoForm;

  // Watch for controlled inputs
  const regionId = watch('regionId');
  const communeId = watch('communeId');

  if (!profile) return null;

  return (
    <FormLayout onSubmit={handleSubmit} columns={4} data-testid="company-profile-info-form">
      {/* Sección 1: Datos de Empresa */}
      <FormLayout.Section title="Datos de Empresa">
        <LabelInput
          label="ID empresa"
          value={String(profile.id)}
          disabled
          variant="standard"
          data-testid="input-company-id"
        />
        <LabelInput
          label="RUT"
          value={formatRut(profile.rut + profile.dv)}
          disabled
          required
          variant="standard"
          data-testid="input-company-rut"
        />
        <LabelInput
          label="Razón Social"
          required
          registration={register('name')}
          variant="standard"
          hasError={!!errors.name}
          errorMessage={errors.name?.message}
          data-testid="input-company-name"
        />
        <LabelInput
          label="Nombre de Fantasía"
          required
          registration={register('fantasyName')}
          variant="standard"
          hasError={!!errors.fantasyName}
          errorMessage={errors.fantasyName?.message}
          data-testid="input-company-fantasy-name"
        />
      </FormLayout.Section>

      {/* Sección 2: Dirección de Empresa */}
      <FormLayout.Section title="Dirección de Empresa">
        <LabelInput
          label="Nombre de calle"
          required
          registration={register('address')}
          variant="standard"
          hasError={!!errors.address}
          errorMessage={errors.address?.message}
          data-testid="input-company-address"
        />
        <LabelInput
          label="Numeración"
          required
          registration={register('addressNumber')}
          variant="standard"
          hasError={!!errors.addressNumber}
          errorMessage={errors.addressNumber?.message}
          data-testid="input-company-address-number"
        />
        <Selector
          label="Región"
          required
          value={regionId ? String(regionId) : undefined}
          onChange={(value) => {
            const numericValue = normalizeNumericSelectValue(value);
            setValue('regionId', numericValue || null);
            // Reset commune when region changes
            if (!numericValue) {
              setValue('communeId', null);
            }
          }}
          options={regionOptions}
          placeholder="Selecciona región"
          color={errors.regionId ? 'error' : 'default'}
          supportingText={errors.regionId?.message}
          data-testid="select-company-region"
        />
        <Selector
          label="Comuna"
          required
          value={communeId ? String(communeId) : undefined}
          onChange={(value) => {
            const numericValue = normalizeNumericSelectValue(value);
            setValue('communeId', numericValue || null);
          }}
          options={communeOptions}
          placeholder="Selecciona comuna"
          disabled={!regionId}
          color={errors.communeId ? 'error' : 'default'}
          supportingText={errors.communeId?.message}
          data-testid="select-company-commune"
        />
      </FormLayout.Section>

      {/* Sección 3: Contacto de Empresa */}
      <FormLayout.Section title="Contacto de Empresa">
        <LabelInput
          label="Nombre"
          required
          registration={register('contactName')}
          variant="standard"
          hasError={!!errors.contactName}
          errorMessage={errors.contactName?.message}
          data-testid="input-contact-name"
        />
        <LabelInput
          label="Correo"
          required
          registration={register('contactEmail')}
          type="email"
          variant="standard"
          hasError={!!errors.contactEmail}
          errorMessage={errors.contactEmail?.message}
          data-testid="input-contact-email"
        />
        <LabelInput
          label="Teléfono"
          required
          registration={register('contactPhone')}
          variant="standard"
          hasError={!!errors.contactPhone}
          errorMessage={errors.contactPhone?.message}
          data-testid="input-contact-phone"
        />
        <div aria-hidden="true" className="hidden md:block" />
      </FormLayout.Section>

      {/* Footer */}
      <FormLayout.Footer
        cancelButton={
          <PrimaryButton type="button" variant="outline" onClick={onCancel} data-testid="btn-cancel">
            Cancelar
          </PrimaryButton>
        }
        primaryButton={
          <PrimaryButton type="submit" isLoading={savingInfo} data-testid="btn-save">
            Guardar
          </PrimaryButton>
        }
      />
    </FormLayout>
  );
};

export default CompanyProfileInfoForm;
