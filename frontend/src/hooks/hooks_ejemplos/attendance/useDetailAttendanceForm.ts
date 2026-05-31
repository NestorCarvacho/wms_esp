import { useMemo } from 'react';
import type { AttendanceDetail } from '@/api/domains/attendance/attendance.types';


export interface UseDetailAttendanceFormOptions {
  detail: AttendanceDetail | null;
}

export const useDetailAttendanceForm = ({ detail }: UseDetailAttendanceFormOptions) => {
  const fecha = detail?.fecha ?? '';
  const hora = detail?.hora ?? '';
  const tipo = detail?.tipo ?? '';
  const evento = detail?.evento ?? '';
  const deviceInformation = detail?.deviceInformation ?? '';
  const ubicacion = detail?.ubicacion ?? '';

  const mapUrl = detail?.mapUrl ?? undefined;
  const isUnavailable = !detail?.mapUrl; 

  const imageUrl = useMemo(() => {
    if (!detail) return undefined;
    if (detail.photoUrl) return detail.photoUrl;
    if (detail.photoBase64) {
      // If somehow still includes data URI prefix, just return it
      if (detail.photoBase64.startsWith('data:image/')) return detail.photoBase64;
      return `data:image/jpeg;base64,${detail.photoBase64}`;
    }
    return undefined;
  }, [detail]);

  return {
    fecha,
    hora,
    tipo,
    evento,
    deviceInformation,
    ubicacion,
    mapUrl,
    isUnavailable,
    imageUrl,
  } as const;
};

export default useDetailAttendanceForm;
