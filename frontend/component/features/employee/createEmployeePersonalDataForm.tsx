import React from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, UseFormTrigger } from 'react-hook-form';
import { LabelInput } from '@/components/ui/inputs';
import { Selector } from '@/components/ui/inputs/Selector';
import { DatePicker } from '@/components/ui/filters/DatePicker';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormLayout } from '@/components/layout';
import type { CreateEmployeePersonalData } from '@/schemas/employee/createEmployeeForm';
import {
  normalizeSelectValue,
  normalizeSelectToNumber,
  normalizeSelectWithFallback,
  normalizeWatchValue,
  normalizeWatchValueToString,
} from '@/utils/formHelpers';


interface CreateEmployeePersonalDataFormProps {
  personalForm: {
    register: UseFormRegister<CreateEmployeePersonalData>;
    setValue: UseFormSetValue<CreateEmployeePersonalData>;
    watch: UseFormWatch<CreateEmployeePersonalData>;
    errors: FieldErrors<CreateEmployeePersonalData>;
    trigger: UseFormTrigger<CreateEmployeePersonalData>;
  };
  genderOptions: { value: string; label: string }[];
  maritalStatusOptions: { value: string; label: string }[];
  employmentStatusOptions: { value: string; label: string }[];
  usernameSuffix: string | null;
  generatedUsername: string;
  onCancel: () => void;
  onNext?: () => void;
}

export const CreateEmployeePersonalDataForm: React.FC<
  CreateEmployeePersonalDataFormProps
> = ({
  personalForm,
  genderOptions,
  maritalStatusOptions,
  employmentStatusOptions,
  usernameSuffix: _usernameSuffix,
  generatedUsername,
  onCancel,
  onNext,
}) => {
  const [passwordTouched, setPasswordTouched] = React.useState(false);

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
      personalForm.setValue('rutComplete', withoutHyphens);
      return;
    }

    // Auto-format: add hyphen before last character
    // Split into body (all but last char) and DV (last char)
    const body = withoutHyphens.slice(0, -1);
    const dv = withoutHyphens.slice(-1);
    const formatted = `${body}-${dv}`;

    personalForm.setValue('rutComplete', formatted);
  };

  return (
    <FormLayout onSubmit={handleSubmit} columns={3}>
      <FormLayout.Section title="Datos personales del nuevo colaborador">
        {/* Row 1: Username (disabled, auto-generated) */}
        <LabelInput
          label="Nombre de usuario"
          value={generatedUsername}
          onChange={() => {}}
          variant="standard"
          disabled
          placeholder="Se generará automáticamente desde el RUT"
        />
        <div aria-hidden="true" className="hidden md:block" />
        <div aria-hidden="true" className="hidden md:block" />

        {/* Row 2: RUT, Password, Fecha de nacimiento */}
        <LabelInput
          label="RUT"
          value={personalForm.watch('rutComplete')}
          onChange={handleRutChange}
          variant="standard"
          placeholder="12345678-9"
          required
          hasError={!!personalForm.errors.rutComplete}
          errorMessage={personalForm.errors.rutComplete?.message}
        />
        <LabelInput
          label="Contraseña"
          type="password"
          value={personalForm.watch('password')}
          onChange={(value) => {
            personalForm.setValue('password', value);
            if (passwordTouched) {
              void personalForm.trigger('password');
            }
          }}
          onBlur={() => {
            setPasswordTouched(true);
            void personalForm.trigger('password');
          }}
          variant="standard"
          required
          hasError={!!personalForm.errors.password}
          errorMessage={personalForm.errors.password?.message}
          data-testid="password-input"
        />
        <DatePicker
          label="Fecha de nacimiento"
          value={normalizeWatchValue(personalForm.watch('birthDate'))}
          onChange={(value) => personalForm.setValue('birthDate', normalizeWatchValueToString(value))}
          placeholder="dd/mm/aaaa"
          variant="standard"
          hasError={!!personalForm.errors.birthDate}
          errorMessage={personalForm.errors.birthDate?.message}
        />

        {/* Row 3: Nombres, Apellido paterno, Apellido materno */}
        <LabelInput
          label="Nombres"
          value={personalForm.watch('firstNames')}
          onChange={(value) => personalForm.setValue('firstNames', value)}
          variant="standard"
          required
          hasError={!!personalForm.errors.firstNames}
          errorMessage={personalForm.errors.firstNames?.message}
          data-testid="firstNames-input"
        />
        <LabelInput
          label="Apellido paterno"
          value={personalForm.watch('lastName')}
          onChange={(value) => personalForm.setValue('lastName', value)}
          variant="standard"
          required
          hasError={!!personalForm.errors.lastName}
          errorMessage={personalForm.errors.lastName?.message}
          data-testid="lastName-input"
        />
        <LabelInput
          label="Apellido materno"
          value={personalForm.watch('secondLastName')}
          onChange={(value) => personalForm.setValue('secondLastName', value)}
          variant="standard"
          hasError={!!personalForm.errors.secondLastName}
          errorMessage={personalForm.errors.secondLastName?.message}
          data-testid="secondLastName-input"
        />

        {/* Row 4: Sexo, Estado civil, Estado del empleado */}
        <Selector
          label="Sexo"
          value={normalizeWatchValue(personalForm.watch('genderCode'))}
          onChange={(value) => personalForm.setValue('genderCode', normalizeSelectValue(value))}
          options={genderOptions}
          placeholder="Selecciona sexo"
          required
          color={personalForm.errors.genderCode ? 'error' : undefined}
          supportingText={personalForm.errors.genderCode?.message}
        />
        <Selector
          label="Estado civil"
          value={personalForm.watch('maritalStatusId')
            ? String(personalForm.watch('maritalStatusId'))
            : undefined}
          onChange={(value) => {
            personalForm.setValue('maritalStatusId', normalizeSelectToNumber(value));
          }}
          options={maritalStatusOptions}
          placeholder="Selecciona estado civil"
          required
          color={personalForm.errors.maritalStatusId ? 'error' : undefined}
          supportingText={personalForm.errors.maritalStatusId?.message}
        />
        <Selector
          label="Estado del empleado"
          value={normalizeSelectWithFallback(personalForm.watch('employmentStatus'), 'V')}
          onChange={(value) => personalForm.setValue('employmentStatus', normalizeSelectWithFallback(value, 'V'))}
          options={employmentStatusOptions}
          placeholder="Selecciona estado"
          required
          color={personalForm.errors.employmentStatus ? 'error' : undefined}
          supportingText={personalForm.errors.employmentStatus?.message}
        />
      </FormLayout.Section>

      <FormLayout.Footer
        cancelButton={
          <PrimaryButton type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </PrimaryButton>
        }
        primaryButton={
          onNext ? (
            <PrimaryButton 
              type="button" 
              onClick={async () => {
                const isValid = await personalForm.trigger();
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

export default CreateEmployeePersonalDataForm;
