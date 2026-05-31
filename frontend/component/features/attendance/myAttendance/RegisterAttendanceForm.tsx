import React from 'react';
import { LabelInput } from '@/components/ui/inputs/LabelInput';
import { Selector } from '@/components/ui/inputs/Selector';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { IconScout } from '@/components/ui/images/IconScout';
import {
  useRegisterAttendanceForm,
  type AttendanceRecord,
} from '@/hooks/attendance/useRegisterAttendanceForm.ts';
import { GoogleStaticMap } from '@/components/ui/maps/GoogleStaticMap';


interface RegisterAttendanceFormProps {
  onSubmit?: (data: any) => void;
  readOnly?: boolean;
  record?: AttendanceRecord;
}

export const RegisterAttendanceForm: React.FC<RegisterAttendanceFormProps> = ({
  onSubmit,
  readOnly,
  record,
}) => {
  const {
    fecha,
    hora,
    locations,
    locationValue,
    effectiveReadOnly,
    setLocationValue,
    isSubmitting,
    handleSubmit,
    mapUrl,
    mapLoading,
    mapUnavailable,
    errors,
    isSubmitted,
  } = useRegisterAttendanceForm({ onSubmit, readOnly, record });

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      data-testid="registro-asistencia-form"
    >
      {/* Static map preview */}
      <div className="w-full flex justify-center">
        <GoogleStaticMap
          width={320}
          height={220}
          mapUrl={mapUrl}
          loading={mapLoading}
          isUnavailable={mapUnavailable}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <LabelInput
          label="Fecha"
          value={fecha}
          disabled
          variant="standard"
          iconRight={<IconScout name="calendarAlt" size="sm" />}
        />
        <LabelInput
          label="Hora"
          value={hora}
          disabled
          variant="standard"
          iconRight={<IconScout name="clockThree" size="sm" />}
        />
        <Selector
          label="Ubicación"
          placeholder="Selecciona la ubicación"
          options={locations}
          value={locationValue}
          onChange={(val: string | string[]) => {
            if (Array.isArray(val)) {
              const first = val[0] ?? '';
              setLocationValue(first);
            } else {
              setLocationValue(val);
            }
          }}
          disabled={effectiveReadOnly || isSubmitting}
          color={errors?.ubicacion && isSubmitted ? 'error' : 'default'}
          supportingText={
            errors?.ubicacion && isSubmitted
              ? (errors.ubicacion.message as string)
              : undefined
          }
        />
      </div>

      {!effectiveReadOnly && (
        <div className="flex justify-center pt-4">
          <PrimaryButton type="submit" fullWidth isLoading={isSubmitting} disabled={isSubmitting}>
            Registrar Asistencia
          </PrimaryButton>
        </div>
      )}
    </form>
  );
};

export default RegisterAttendanceForm;
