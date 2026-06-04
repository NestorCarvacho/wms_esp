import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { DatePicker } from '@/components/ui/filters/DatePicker';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import FormLayout from '@/components/layout/FormLayout';
import { ROUTE_DEFINITIONS } from '@/routes';
import type { EmployeeProfile } from '@/api/domains/employee';
import {
  normalizeWatchValue,
  normalizeWatchValueToString,
} from '@/utils/formHelpers';


interface PersonalDataFormProps {
  profile: EmployeeProfile | null;
  genderOptions: { value: string; label: string }[];
  maritalStatusOptions: { value: string; label: string }[];
  employmentStatusOptions: { value: string; label: string }[];
  onCancel: () => void;
  personalForm: {
    register: any;
    handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    setValue: any;
    watch: any;
    errors: any;
    isSubmitting: boolean;
  };
}

export const EmployeeProfilePersonalDataForm: React.FC<PersonalDataFormProps> = ({
  profile,
  genderOptions,
  maritalStatusOptions,
  employmentStatusOptions,
  onCancel,
  personalForm,
}) => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, errors, isSubmitting } = personalForm;

  // Watch for controlled inputs
  const birthDate = watch('birthDate');
  const genderCode = watch('genderCode');
  const maritalStatusId = watch('maritalStatusId');
  const employmentStatus = watch('employmentStatus');

  if (!profile) return null;

  return (
    <FormLayout onSubmit={handleSubmit} columns={3}>
      <FormLayout.Section title="Datos personales del colaborador">
        {/* Row 1: Rut, Fecha de nacimiento */}
        <LabelInput 
          label="RUT" 
          value={profile.rutFull} 
          disabled={true} 
          variant="standard"
        />
        <DatePicker 
          label="Fecha de nacimiento" 
          value={normalizeWatchValue(birthDate)} 
          onChange={(value) => setValue('birthDate', normalizeWatchValueToString(value))} 
          placeholder="dd/mm/aaaa" 
          variant="standard"
          hasError={!!errors.birthDate}
          errorMessage={errors.birthDate?.message}
        />
        <div aria-hidden="true" className="hidden md:block" />

        {/* Row 2: Nombre, Apellido paterno, Apellido materno */}
        <LabelInput 
          label="Nombres" 
          registration={register('firstNames')}
          variant="standard"
          hasError={!!errors.firstNames}
          errorMessage={errors.firstNames?.message}
        />
        <LabelInput 
          label="Apellido paterno" 
          registration={register('lastName')}
          variant="standard"
          hasError={!!errors.lastName}
          errorMessage={errors.lastName?.message}
        />
        <LabelInput 
          label="Apellido materno" 
          registration={register('secondLastName')}
          variant="standard"
          hasError={!!errors.secondLastName}
          errorMessage={errors.secondLastName?.message}
        />

        {/* Row 3: Sexo, Estado civil, Estado */}
        <ComboBox
          label="Sexo"
          value={genderCode || undefined}
          onChange={(value) => setValue('genderCode', value as string)}
          options={genderOptions}
          placeholder="Selecciona sexo"
          color={errors.genderCode ? 'error' : 'default'}
          supportingText={errors.genderCode?.message}
        />
        <ComboBox
          label="Estado civil"
          value={maritalStatusId ? String(maritalStatusId) : undefined}
          onChange={(value) => setValue('maritalStatusId', value ? Number(value) : 0)}
          options={maritalStatusOptions}
          placeholder="Selecciona estado civil"
          color={errors.maritalStatusId ? 'error' : 'default'}
          supportingText={errors.maritalStatusId?.message}
        />
        <ComboBox
          label="Estado"
          value={employmentStatus || undefined}
          onChange={(value) => setValue('employmentStatus', value as string)}
          options={employmentStatusOptions}
          placeholder="Selecciona estado"
          color={errors.employmentStatus ? 'error' : 'default'}
          supportingText={errors.employmentStatus?.message}
        />
      </FormLayout.Section>

      <FormLayout.Footer
        cancelButton={
          <PrimaryButton type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </PrimaryButton>
        }
        secondaryButton={
          <PrimaryButton 
            type="button" 
            variant="outline" 
            onClick={() => {
              if (profile?.id) {
                void navigate(`${ROUTE_DEFINITIONS.EMPLEADO_CONTRATOS.path}?employeeId=${profile.id}`);
              }
            }}
          >
            Ver contratos
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

export default EmployeeProfilePersonalDataForm;
