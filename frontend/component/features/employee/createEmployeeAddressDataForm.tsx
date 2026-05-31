import React from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, UseFormTrigger } from 'react-hook-form';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormLayout } from '@/components/layout';
import type { CreateEmployeeAddressData } from '@/schemas/employee/createEmployeeForm';
import { normalizeSelectToNumber, normalizeWatchValueToString } from '@/utils/formHelpers';


interface CreateEmployeeAddressDataFormProps {
  addressForm: {
    register: UseFormRegister<CreateEmployeeAddressData>;
    setValue: UseFormSetValue<CreateEmployeeAddressData>;
    watch: UseFormWatch<CreateEmployeeAddressData>;
    errors: FieldErrors<CreateEmployeeAddressData>;
    trigger: UseFormTrigger<CreateEmployeeAddressData>;
  };
  regionOptions: { value: string; label: string }[];
  communeOptions: { value: string; label: string }[];
  onCancel: () => void;
  onCreate: () => Promise<void>;
  creating?: boolean;
  onPrevious?: () => void;
}

export const CreateEmployeeAddressDataForm: React.FC<CreateEmployeeAddressDataFormProps> = ({
  addressForm,
  regionOptions,
  communeOptions,
  onCancel,
  onCreate,
  creating = false,
  onPrevious,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void onCreate();
  };

  return (
    <FormLayout onSubmit={handleSubmit} columns={2}>
      <FormLayout.Section title="Dirección del nuevo colaborador">
        {/* Row 1: Región, Comuna */}
        <Selector
          label="Región"
          value={addressForm.watch('regionId') ? String(addressForm.watch('regionId')) : undefined}
          onChange={(value) => {
            const numericValue = normalizeSelectToNumber(value);
            addressForm.setValue('regionId', numericValue || null);
            // Reset commune when region changes
            if (!numericValue) {
              addressForm.setValue('communeId', null);
            }
          }}
          options={regionOptions}
          placeholder="Selecciona región"
          color={addressForm.errors.regionId ? 'error' : undefined}
          supportingText={addressForm.errors.regionId?.message}
        />
        <Selector
          label="Comuna"
          value={addressForm.watch('communeId') ? String(addressForm.watch('communeId')) : undefined}
          onChange={(value) => {
            const numericValue = normalizeSelectToNumber(value);
            addressForm.setValue('communeId', numericValue || null);
          }}
          options={communeOptions}
          placeholder="Selecciona comuna"
          disabled={!addressForm.watch('regionId')}
          color={addressForm.errors.communeId ? 'error' : undefined}
          supportingText={addressForm.errors.communeId?.message}
        />
        
        {/* Row 2: Dirección (spans 2 columns) */}
        <LabelInput 
          className="md:col-span-2" 
          label="Dirección" 
          value={normalizeWatchValueToString(addressForm.watch('address'))} 
          onChange={(value) => addressForm.setValue('address', value)} 
          variant="standard"
          placeholder="Calle, número, departamento, etc."
          hasError={!!addressForm.errors.address}
          errorMessage={addressForm.errors.address?.message}
        />
      </FormLayout.Section>

      <FormLayout.Footer
        cancelButton={
          <PrimaryButton type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </PrimaryButton>
        }
        secondaryButton={
          onPrevious ? (
            <PrimaryButton type="button" variant="outline" onClick={onPrevious}>
              Anterior
            </PrimaryButton>
          ) : undefined
        }
        primaryButton={
          <PrimaryButton 
            type="button" 
            onClick={async () => {
              const isValid = await addressForm.trigger();
              if (isValid) await onCreate();
            }}
            isLoading={creating}
          >
            Crear colaborador
          </PrimaryButton>
        }
      />
    </FormLayout>
  );
};

export default CreateEmployeeAddressDataForm;
