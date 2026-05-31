import React from 'react';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import FormLayout from '@/components/layout/FormLayout';
import type { EmployeeProfile } from '@/api/domains/employee';
import { normalizeSelectToNumber } from '@/utils/formHelpers';


interface AddressDataFormProps {
  profile: EmployeeProfile | null;
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  onCancel: () => void;
  addressForm: {
    register: any;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: any;
    watch: any;
    errors: any;
    isSubmitting: boolean;
  };
}

export const EmployeeProfileAddressDataForm: React.FC<AddressDataFormProps> = ({
  profile,
  regionOptions,
  communeOptions,
  onCancel,
  addressForm,
}) => {
  const { register, handleSubmit, setValue, watch, errors, isSubmitting } = addressForm;

  // Watch for controlled inputs
  const regionId = watch('regionId');
  const communeId = watch('communeId');

  if (!profile) return null;

  return (
    <FormLayout onSubmit={handleSubmit} columns={2}>
      <FormLayout.Section title="Dirección del colaborador">
        {/* Row 1: Región, Comuna */}
        <Selector
          label="Región"
          value={regionId ? String(regionId) : undefined}
          onChange={(value) => {
            const numericValue = normalizeSelectToNumber(value);
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
        />
        <Selector
          label="Comuna"
          value={communeId ? String(communeId) : undefined}
          onChange={(value) => {
            const numericValue = normalizeSelectToNumber(value);
            setValue('communeId', numericValue || null);
          }}
          options={communeOptions}
          placeholder="Selecciona comuna"
          disabled={!regionId}
          color={errors.communeId ? 'error' : 'default'}
          supportingText={errors.communeId?.message}
        />
        
        {/* Row 2: Dirección (spans 2 columns) */}
        <LabelInput 
          className="md:col-span-2" 
          label="Dirección" 
          registration={register('address')}
          variant="standard"
          hasError={!!errors.address}
          errorMessage={errors.address?.message}
        />
      </FormLayout.Section>

      <FormLayout.Footer
        cancelButton={
          <PrimaryButton type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </PrimaryButton>
        }
        primaryButton={
          <PrimaryButton type="submit" isLoading={isSubmitting}>
            Guardar
          </PrimaryButton>
        }
      />
    </FormLayout>
  );
};

export default EmployeeProfileAddressDataForm;
