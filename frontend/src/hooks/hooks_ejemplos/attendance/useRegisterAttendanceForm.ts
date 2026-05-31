import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUI } from '@/hooks';
import {
  registerAttendanceFormSchema,
  type RegisterAttendanceFormValues,
} from '@/schemas/attendance/registerAttendanceForm.ts';
import { serverTimeService } from '@/api/domains/serverTime/serverTime.service.ts';
import { locationService } from '@/api/domains/location/location.service.ts';
import { attendanceService } from '@/api/domains/attendance/attendance.service.ts';


export interface AttendanceRecord {
  id?: string;
  fecha?: string;
  hora?: string;
  ubicacion?: string; // label
  [key: string]: unknown;
}

interface UseRegisterAttendanceFormParams {
  onSubmit?: (data: RegisterAttendanceFormValues) => void;
  readOnly?: boolean;
  record?: AttendanceRecord;
}

export function useRegisterAttendanceForm({
  onSubmit,
  readOnly,
  record,
}: UseRegisterAttendanceFormParams) {
  const { showNotification, closeSidePanel } = useUI();
  const [locations, setLocations] = useState<{ value: string; label: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Map preview state (generated once on panel open)
  const [mapUrl, setMapUrl] = useState<string | undefined>(undefined);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [mapUnavailable, setMapUnavailable] = useState<boolean>(false);
  const mapRequestedRef = useRef<boolean>(false);

  const [serverBaseMs, setServerBaseMs] = useState<number | null>(null);
  const [clientBaseMs, setClientBaseMs] = useState<number | null>(null);
  const tickTimerRef = useRef<number | null>(null);

  const now = useMemo(() => new Date(), []);
  const fallbackFecha = useMemo(() => now.toISOString().slice(0, 10), [now]); // YYYY-MM-DD
  const [horaState, setHoraState] = useState<string>(() => {
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`; // HH:mm
  });

  const toHHmm = (value?: string): string => {
    if (!value) return '';
    // Patterns: HH:mm:ss, HH:mm, with optional AM/PM
    const match = value.match(/^(\d{2}):(\d{2})(?::\d{2})?(?:\s?[APap][Mm])?$/);
    if (match) {
      const [, hh, mm] = match;
      return `${hh}:${mm}`;
    }
    // Try Date parse
    const dt = new Date(value);
    if (!isNaN(dt.getTime())) {
      const hh = dt.getHours().toString().padStart(2, '0');
      const mm = dt.getMinutes().toString().padStart(2, '0');
      return `${hh}:${mm}`;
    }
    return value;
  };

  // Load server time once, then tick from client offset every 60s
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const response = await serverTimeService.get();
      if (response.success && response.data?.localDateTime) {
        const serverNow = new Date(response.data.localDateTime);
        if (!isNaN(serverNow.getTime())) {
          if (!mounted) return;
          setServerBaseMs(serverNow.getTime());
          setClientBaseMs(Date.now());
          const hh = serverNow.getHours().toString().padStart(2, '0');
          const mm = serverNow.getMinutes().toString().padStart(2, '0');
          setHoraState(`${hh}:${mm}`);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Establish a minute tick using the base offset
    if (serverBaseMs == null || clientBaseMs == null) return;
    const updateFromOffset = () => {
      const elapsed = Date.now() - clientBaseMs;
      const current = new Date(serverBaseMs + elapsed);
      const hh = current.getHours().toString().padStart(2, '0');
      const mm = current.getMinutes().toString().padStart(2, '0');
      setHoraState(`${hh}:${mm}`);
    };
    // Align next minute boundary
    const nowMs = Date.now();
    const elapsed = nowMs - clientBaseMs;
    const current = new Date(serverBaseMs + elapsed);
    const msToNextMinute = (60 - current.getSeconds()) * 1000 - current.getMilliseconds();
    const startTimeout = window.setTimeout(() => {
      updateFromOffset();
      tickTimerRef.current = window.setInterval(updateFromOffset, 60_000) as unknown as number;
    }, Math.max(0, msToNextMinute));
    return () => {
      window.clearTimeout(startTimeout);
      if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    };
  }, [serverBaseMs, clientBaseMs]);

  // Load locations
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const response = await locationService.getEmployeeEnabledLocations();
      if (response.success && response.data) {
        const opts = (response.data.enabledLocations || []).map((loc) => ({
          value: String(loc.ubicationId),
          label: loc.ubicationName ?? `Ubicación ${loc.ubicationId}`,
        }));
        if (mounted) setLocations(opts);
      } else {
        // Fallback: empty
        setLocations([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const effectiveReadOnly = !!readOnly;

  const [locationValue, setLocationValue] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (record?.ubicacion) {
      // record.ubicacion is label; try to match
      const found = locations.find((o) => o.label === record.ubicacion);
      setLocationValue(found?.value ?? locations[0]?.value);
    } else if (!locationValue && locations.length) {
      setLocationValue(locations[0].value);
    }
  }, [record?.ubicacion, locations, locationValue]);

  const fecha = record?.fecha ?? fallbackFecha;
  const hora = record?.hora ? toHHmm(record.hora) : horaState; // HH:mm

  const {
    handleSubmit: rhfHandleSubmit,
    setValue,
    register,
    unregister,
    formState,
  } = useForm<RegisterAttendanceFormValues>({
    resolver: zodResolver(registerAttendanceFormSchema),
    defaultValues: {
      fecha,
      hora, // HH:mm
      ubicacion: locationValue ?? '', // value should be locationId as string
    },
  });

  useEffect(() => {
    register('fecha');
    register('hora');
    register('ubicacion');
    return () => {
      unregister('fecha');
      unregister('hora');
      unregister('ubicacion');
    };
  }, [register, unregister]);

  useEffect(() => {
    setValue('fecha', fecha, { shouldValidate: false });
    setValue('hora', hora, { shouldValidate: false });
  }, [fecha, hora, setValue]);

  useEffect(() => {
    setValue('ubicacion', locationValue ?? '', { shouldValidate: true });
  }, [locationValue, setValue]);

  const fieldsRegisteredRef = useRef(false);
  useEffect(() => {
    fieldsRegisteredRef.current = true;
    return () => { fieldsRegisteredRef.current = false; };
  }, []);
  const isReady = useMemo(() => {
    const hasFecha = typeof fecha === 'string' && fecha.length > 0;
    const hasHora = typeof hora === 'string' && hora.length > 0;
    // Require explicit selected location; avoid implicit fallbacks to lower branch count
    const hasUbicacion = typeof locationValue === 'string' && locationValue.length > 0;
    return fieldsRegisteredRef.current && hasFecha && hasHora && hasUbicacion;
  }, [fecha, hora, locationValue]);

  const requestGeolocation = (
  ): Promise<{ latitude?: number; longitude?: number }> => new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({});
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        resolve({});
      },
      { maximumAge: 0, enableHighAccuracy: true, timeout: 10000 },
    );
  });

  // On mount: obtain geolocation and generate static map (single execution)
  useEffect(() => {
    if (mapRequestedRef.current) return; // Guard double mount (StrictMode) & re-renders
    mapRequestedRef.current = true;
    setMapLoading(true);
    setMapUnavailable(false);
    void (async () => {
      try {
        const coords = await requestGeolocation();
        if (coords.latitude == null || coords.longitude == null) {
          setMapLoading(false);
          setMapUnavailable(true);
          return;
        }
        const response = await locationService.generateMap({
          latitude: coords.latitude,
          longitude: coords.longitude,
          mapWidth: 320,
          mapHeight: 220,
          zoomLevel: 16,
        });
        if (response.success && response.data?.mapUrl) {
          setMapUrl(response.data.mapUrl);
          setMapLoading(false);
        } else {
          setMapLoading(false);
          setMapUnavailable(true);
        }
      } catch {
        setMapLoading(false);
        setMapUnavailable(true);
      }
    })();
  }, []);

  const onValid = useCallback(
    async (data: RegisterAttendanceFormValues) => {
      if (readOnly) return;
      setIsSubmitting(true);
      const ubicacionStr = (data.ubicacion && data.ubicacion.trim().length > 0)
        ? data.ubicacion
        : (locationValue ?? '');
      const locationId = Number(ubicacionStr);
      if (!Number.isFinite(locationId) || locationId <= 0) {
        setIsSubmitting(false);
        return;
      }
      const coords = await requestGeolocation();
      const response = await attendanceService.register({
        locationId,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      if (response.success && response.data?.isSuccessful) {
        const message = response.data.message || 'Asistencia registrada correctamente';
        showNotification('success', message, 5000);
        onSubmit?.({ ...data, ubicacion: String(locationId) });
        closeSidePanel?.();
      } else {
        const msg =
          response.error?.description
          || response.data?.message
          || 'No se pudo registrar la asistencia';
        showNotification('error', msg, 5000);
      }
      setIsSubmitting(false);
    },
    [showNotification, onSubmit, closeSidePanel, readOnly, locationValue],
  );

  const onInvalid = useCallback((): void => {
  }, []);

  const handleSubmit = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
        event.stopPropagation();
      }
      if (effectiveReadOnly) return;
      const wrappedValid = (data: RegisterAttendanceFormValues) => { void onValid(data); };
      const wrappedInvalid = () => { onInvalid(); };
      const runner = rhfHandleSubmit(wrappedValid, wrappedInvalid);
      void runner(event as any);
    },
    [rhfHandleSubmit, onValid, onInvalid, effectiveReadOnly],
  );

  return {
    fecha,
    hora,
    locations,
    locationValue,
    setLocationValue,
    effectiveReadOnly,
    isSubmitting,
    isReady,
    handleSubmit,
    errors: formState.errors,
    isSubmitted: formState.isSubmitted,
    mapUrl,
    mapLoading,
    mapUnavailable,
  } as const;
}
