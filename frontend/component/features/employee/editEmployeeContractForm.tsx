import React from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors, UseFormTrigger } from 'react-hook-form';
import { LabelInput } from '@/components/ui/inputs';
import { ComboBox } from '@/components/ui/inputs/ComboBox';
import { DatePicker } from '@/components/ui/filters/DatePicker';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { FormLayout } from '@/components/layout';
import { useTranslation } from '@/i18n';
import { normalizeSelectToNumber } from '@/utils/formHelpers';
import type { UpdateEmployeeContractFormData } from '@/schemas/employee/employeeContractEdit.schema';


interface EditEmployeeContractFormProps {
  contractForm: {
    register: UseFormRegister<UpdateEmployeeContractFormData>;
    setValue: UseFormSetValue<UpdateEmployeeContractFormData>;
    watch: UseFormWatch<UpdateEmployeeContractFormData>;
    errors: FieldErrors<UpdateEmployeeContractFormData>;
    trigger: UseFormTrigger<UpdateEmployeeContractFormData>;
  };
  contractStatusOptions: { value: string; label: string }[];
  contractTypeOptions: { value: string; label: string }[];
  contractModalityOptions: { value: string; label: string }[];
  companyOptions: { value: string; label: string }[];
  areaOptions: { value: string; label: string }[];
  positionOptions: { value: string; label: string }[];
  costCenterOptions: { value: string; label: string }[];
  unionOptions: { value: string; label: string }[];
  updating: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const EditEmployeeContractForm: React.FC<EditEmployeeContractFormProps> = ({
  contractForm,
  contractStatusOptions,
  contractTypeOptions,
  contractModalityOptions,
  companyOptions,
  areaOptions,
  positionOptions,
  costCenterOptions,
  unionOptions,
  updating,
  onCancel,
  onSave,
}) => {
  const { t: translate } = useTranslation();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <FormLayout onSubmit={handleSubmit} columns={4}>
      {/* Sección 1: Datos del contrato */}
      <FormLayout.Section title="Datos del contrato">
        <ComboBox
          label={translate('employee:contracts.fields.contractStatus')}
          required
          options={contractStatusOptions}
          value={contractForm.watch('contractStatusId')?.toString() || ''}
          onChange={(value: string | string[]) => {
            const numericValue = normalizeSelectToNumber(value);
            contractForm.setValue('contractStatusId', numericValue || 0, { shouldValidate: true });
          }}
          color={contractForm.errors.contractStatusId ? 'error' : 'default'}
          supportingText={contractForm.errors.contractStatusId?.message}
          data-testid="contract-status-select"
        />

        <ComboBox
          label={translate('employee:contracts.fields.companyContract')}
          required
          options={companyOptions}
          value={contractForm.watch('companyContractId')?.toString() || ''}
          onChange={(value: string | string[]) => {
            const numericValue = normalizeSelectToNumber(value);
            contractForm.setValue('companyContractId', numericValue || 0, { shouldValidate: true });
          }}
          color={contractForm.errors.companyContractId ? 'error' : 'default'}
          supportingText={contractForm.errors.companyContractId?.message}
          data-testid="company-contract-select"
        />

        <LabelInput
          label={translate('employee:contracts.fields.contractName')}
          required
          hasError={!!contractForm.errors.contractName}
          errorMessage={contractForm.errors.contractName?.message}
          value={contractForm.watch('contractName') || ''}
          onChange={(value: string) => contractForm.setValue('contractName', value, { shouldValidate: true })}
          variant="standard"
          placeholder={translate('employee:contracts.fields.contractNamePlaceholder')}
          data-testid="contract-name-input"
        />

        <LabelInput
          label={translate('employee:contracts.fields.contractNumber')}
          required
          value={contractForm.watch('contractNumber')?.toString() || ''}
          onChange={() => {}}
          variant="standard"
          disabled
          data-testid="contract-number-input"
        />

        <ComboBox
          label={translate('employee:contracts.fields.contractType')}
          required
          options={contractTypeOptions}
          value={contractForm.watch('contractTypeId')?.toString() || ''}
          onChange={(value: string | string[]) => {
            const numericValue = normalizeSelectToNumber(value);
            contractForm.setValue('contractTypeId', numericValue || 0, { shouldValidate: true });
          }}
          color={contractForm.errors.contractTypeId ? 'error' : 'default'}
          supportingText={contractForm.errors.contractTypeId?.message}
          data-testid="contract-type-select"
        />

        <ComboBox
          label={translate('employee:contracts.fields.contractModality')}
          required
          options={contractModalityOptions}
          value={contractForm.watch('contractModalityId')?.toString() || ''}
          onChange={(value: string | string[]) => {
            const numericValue = normalizeSelectToNumber(value);
            contractForm.setValue('contractModalityId', numericValue || 0, { shouldValidate: true });
          }}
          color={contractForm.errors.contractModalityId ? 'error' : 'default'}
          supportingText={contractForm.errors.contractModalityId?.message}
          data-testid="contract-modality-select"
        />

        <DatePicker
          label={translate('employee:contracts.fields.dateEntry')}
          value={contractForm.watch('dateEntry') || undefined}
          onChange={(date: string) => contractForm.setValue('dateEntry', date, { shouldValidate: true })}
          variant="standard"
          hasError={!!contractForm.errors.dateEntry}
          errorMessage={contractForm.errors.dateEntry?.message}
          placeholder="dd/mm/aaaa"
          closeOnSelect
        />

        <DatePicker
          label={translate('employee:contracts.fields.contractStartDate')}
          value={contractForm.watch('contractStartDate') || undefined}
          onChange={(date: string) => contractForm.setValue('contractStartDate', date, { shouldValidate: true })}
          variant="standard"
          hasError={!!contractForm.errors.contractStartDate}
          errorMessage={contractForm.errors.contractStartDate?.message}
          placeholder="dd/mm/aaaa"
          closeOnSelect
        />

        <DatePicker
          label={translate('employee:contracts.fields.contractEndDate')}
          value={contractForm.watch('contractEndDate') || undefined}
          onChange={(date: string) => contractForm.setValue('contractEndDate', date, { shouldValidate: true })}
          variant="standard"
          hasError={!!contractForm.errors.contractEndDate}
          errorMessage={contractForm.errors.contractEndDate?.message}
          placeholder="dd/mm/aaaa"
          closeOnSelect
        />
      </FormLayout.Section>

      {/* Sección 2: Datos organizacionales */}
      <FormLayout.Section title="Datos organizacionales">
        <ComboBox
          label={translate('employee:contracts.fields.area')}
          options={areaOptions}
          value={contractForm.watch('areaId')?.toString() || ''}
          onChange={(value: string | string[]) => {
            const numericValue = normalizeSelectToNumber(value);
            contractForm.setValue('areaId', numericValue || null, { shouldValidate: true });
          }}
          color={contractForm.errors.areaId ? 'error' : 'default'}
          supportingText={contractForm.errors.areaId?.message}
          data-testid="area-select"
        />

        <ComboBox
          label={translate('employee:contracts.fields.position')}
          required
          options={positionOptions}
          value={contractForm.watch('positionId')?.toString() || ''}
          onChange={(value: string | string[]) => {
            const numericValue = normalizeSelectToNumber(value);
            contractForm.setValue('positionId', numericValue || 0, { shouldValidate: true });
          }}
          color={contractForm.errors.positionId ? 'error' : 'default'}
          supportingText={contractForm.errors.positionId?.message}
          data-testid="position-select"
        />

        <ComboBox
          label={translate('employee:contracts.fields.costCenter')}
          required
          options={costCenterOptions}
          value={contractForm.watch('costCenterId')?.toString() || ''}
          onChange={(value: string | string[]) => {
            const numericValue = normalizeSelectToNumber(value);
            contractForm.setValue('costCenterId', numericValue || 0, { shouldValidate: true });
          }}
          color={contractForm.errors.costCenterId ? 'error' : 'default'}
          supportingText={contractForm.errors.costCenterId?.message}
          data-testid="cost-center-select"
        />

        <ComboBox
          label={translate('employee:contracts.fields.union')}
          options={unionOptions}
          value={contractForm.watch('unionCode') || ''}
          onChange={(value: string | string[]) => {
            const stringValue = Array.isArray(value) ? value[0] : value;
            contractForm.setValue('unionCode', stringValue || null, { shouldValidate: true });
          }}
          color={contractForm.errors.unionCode ? 'error' : 'default'}
          supportingText={contractForm.errors.unionCode?.message}
          data-testid="union-select"
        />
      </FormLayout.Section>

      {/* Action buttons */}
      <FormLayout.Footer
        cancelButton={
          <PrimaryButton type="button" variant="outline" onClick={onCancel} disabled={updating}>
            {translate('common:actions.cancel')}
          </PrimaryButton>
        }
        primaryButton={
          <PrimaryButton type="button" onClick={onSave} disabled={updating}>
            {updating ? translate('common:actions.saving') : translate('common:actions.save')}
          </PrimaryButton>
        }
      />
    </FormLayout>
  );
};

export default EditEmployeeContractForm;
