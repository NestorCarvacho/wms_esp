import React from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, UseFormTrigger } from 'react-hook-form';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormLayout } from '@/components/layout';
import type { CreateEmployeeContactData } from '@/schemas/employee/createEmployeeForm';


interface CreateEmployeeContactDataFormProps {
  contactForm: {
    register: UseFormRegister<CreateEmployeeContactData>;
    setValue: UseFormSetValue<CreateEmployeeContactData>;
    watch: UseFormWatch<CreateEmployeeContactData>;
    errors: FieldErrors<CreateEmployeeContactData>;
    trigger: UseFormTrigger<CreateEmployeeContactData>;
  };
  onCancel: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const CreateEmployeeContactDataForm: React.FC<CreateEmployeeContactDataFormProps> = ({
  contactForm,
  onCancel,
  onNext,
  onPrevious,
}) => {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <FormLayout onSubmit={handleSubmit} columns={2}>
      <FormLayout.Section title="Datos de contacto del nuevo colaborador">
        {/* Row 1: Correo corporativo, Correo personal */}
        <LabelInput 
          label="Correo corporativo" 
          type="email"
          value={contactForm.watch('corporateEmail')} 
          onChange={(value) => contactForm.setValue('corporateEmail', value)} 
          variant="standard"
          placeholder="ejemplo@empresa.com"
          required
          hasError={!!contactForm.errors.corporateEmail}
          errorMessage={contactForm.errors.corporateEmail?.message}
        />
        <LabelInput 
          label="Correo personal" 
          type="email"
          value={contactForm.watch('personalEmail')} 
          onChange={(value) => contactForm.setValue('personalEmail', value)} 
          variant="standard"
          placeholder="ejemplo@correo.com"
          required
          hasError={!!contactForm.errors.personalEmail}
          errorMessage={contactForm.errors.personalEmail?.message}
        />

        {/* Row 2: Teléfono corporativo, Teléfono personal */}
        <LabelInput 
          label="Teléfono corporativo" 
          type="tel"
          value={contactForm.watch('companyPhoneNumber')} 
          onChange={(value) => contactForm.setValue('companyPhoneNumber', value)} 
          variant="standard"
          placeholder="+56912345678"
          hasError={!!contactForm.errors.companyPhoneNumber}
          errorMessage={contactForm.errors.companyPhoneNumber?.message}
        />
        <LabelInput 
          label="Teléfono personal" 
          type="tel"
          value={contactForm.watch('personalPhoneNumber')} 
          onChange={(value) => contactForm.setValue('personalPhoneNumber', value)} 
          variant="standard"
          placeholder="+56987654321"
          hasError={!!contactForm.errors.personalPhoneNumber}
          errorMessage={contactForm.errors.personalPhoneNumber?.message}
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
          onNext ? (
            <PrimaryButton 
              type="button" 
              onClick={async () => {
                const isValid = await contactForm.trigger();
                if (isValid) onNext();
              }}
            >
              Siguiente
            </PrimaryButton>
          ) : undefined
        }
      />
    </FormLayout>
  );
};

export default CreateEmployeeContactDataForm;
