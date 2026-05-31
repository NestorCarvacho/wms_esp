import React from 'react';
import { LabelInput } from '@/components/ui/inputs';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import FormLayout from '@/components/layout/FormLayout';
import type { EmployeeProfile } from '@/api/domains/employee';


interface ContactDataFormProps {
  profile: EmployeeProfile | null;
  onCancel: () => void;
  contactForm: {
    register: any;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    errors: any;
    isSubmitting: boolean;
  };
}

export const EmployeeProfileContactDataForm: React.FC<ContactDataFormProps> = ({
  profile,
  onCancel,
  contactForm,
}) => {
  const { register, handleSubmit, errors, isSubmitting } = contactForm;

  if (!profile) return null;

  return (
    <FormLayout onSubmit={handleSubmit} columns={2}>
      <FormLayout.Section title="Datos de contacto del colaborador">
        <LabelInput 
          label="Correo corporativo" 
          type="email" 
          registration={register('corporateEmail')}
          variant="standard"
          hasError={!!errors.corporateEmail}
          errorMessage={errors.corporateEmail?.message}
        />
        <LabelInput 
          label="Correo personal" 
          type="email" 
          registration={register('personalEmail')}
          variant="standard"
          hasError={!!errors.personalEmail}
          errorMessage={errors.personalEmail?.message}
        />
        <LabelInput 
          label="Teléfono corporativo" 
          registration={register('companyPhoneNumber')}
          variant="standard"
          hasError={!!errors.companyPhoneNumber}
          errorMessage={errors.companyPhoneNumber?.message}
        />
        <LabelInput 
          label="Teléfono personal" 
          registration={register('personalPhoneNumber')}
          variant="standard"
          hasError={!!errors.personalPhoneNumber}
          errorMessage={errors.personalPhoneNumber?.message}
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

export default EmployeeProfileContactDataForm;
