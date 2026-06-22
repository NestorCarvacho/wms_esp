import { getBaseUrl, getToken } from '@/api/client';
import type { Region, Ciudad, Comuna } from '@/types/api';

async function geoFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<T>;
}

export const geografiaApi = {
  regiones: (): Promise<Region[]> =>
    geoFetch<Region[]>('/api/v1/geografia/regiones'),

  ciudades: (regionId?: number): Promise<Ciudad[]> => {
    const params = regionId ? `?region_id=${regionId}` : '';
    return geoFetch<Ciudad[]>(`/api/v1/geografia/ciudades${params}`);
  },

  comunas: (ciudadId?: number, regionId?: number): Promise<Comuna[]> => {
    const params = ciudadId
      ? `?ciudad_id=${ciudadId}`
      : regionId
      ? `?region_id=${regionId}`
      : '';
    return geoFetch<Comuna[]>(`/api/v1/geografia/comunas${params}`);
  },
};
