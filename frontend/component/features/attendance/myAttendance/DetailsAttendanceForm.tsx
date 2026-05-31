import React from 'react';
import { LabelInput } from '@/components/ui/inputs/LabelInput';
import { PrimaryButton } from '@/components/ui/buttons/PrimaryButton';
import { IconScout } from '@/components/ui/images/IconScout';
import type { AttendanceDetail } from '@/api/domains/attendance';
import { GoogleStaticMap } from '@/components/ui/maps/GoogleStaticMap';
import { useDetailAttendanceForm } from '@/hooks/attendance';


export interface DetailsAttendanceFormProps {
  record: AttendanceDetail | null;
  imageUrl?: string;
}

export const DetailsAttendanceForm: React.FC<DetailsAttendanceFormProps> = ({
  record,
  imageUrl: imageUrlProp,
}) => {
  const {
    fecha,
    hora,
    tipo,
    evento,
    deviceInformation,
    ubicacion,
    mapUrl,
    isUnavailable,
    imageUrl,
  } = useDetailAttendanceForm({ detail: record });
  const effectiveImageUrl = imageUrlProp || imageUrl;
  
  return (
    <div className="flex flex-col gap-4" data-testid="detalle-asistencia-form">
      {/* Map */}
      <div className="w-full flex justify-center">
        <GoogleStaticMap mapUrl={mapUrl} isUnavailable={isUnavailable} loading={false} />
      </div>

      <div className="grid grid-cols-1 gap-3">
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
        <LabelInput label="Tipo" value={tipo} disabled variant="standard" />
        <LabelInput label="Evento" value={evento} disabled variant="standard" />
        <LabelInput label="Dispositivo" value={deviceInformation} disabled variant="standard" />
        <LabelInput label="Ubicación" value={ubicacion} disabled variant="standard" />
      </div>

      {effectiveImageUrl && (
        <div className="pt-2 flex justify-center">
          <PrimaryButton
            size="sm"
            variant="outline"
            fullWidth
            onClick={() => {
              window.open(
                effectiveImageUrl,
                '_blank',
                'noopener,noreferrer',
              );
            }}
          >
            Ver foto
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};

export default DetailsAttendanceForm;
