import { useState, useEffect } from 'react';
import { geografiaApi } from '@/api/geografia';
import type { Region, Ciudad, Comuna } from '@/types/api';

export function useGeografia(
  initialRegionId?: number | null,
  initialCiudadId?: number | null,
) {
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [loadingRegiones, setLoadingRegiones] = useState(true);

  useEffect(() => {
    geografiaApi.regiones().then(setRegiones).finally(() => setLoadingRegiones(false));
  }, []);

  useEffect(() => {
    if (initialRegionId) {
      geografiaApi.ciudades(initialRegionId).then(setCiudades);
    }
  }, [initialRegionId]);

  useEffect(() => {
    if (initialCiudadId) {
      geografiaApi.comunas(initialCiudadId).then(setComunas);
    }
  }, [initialCiudadId]);

  const onRegionChange = async (regionId: number | null) => {
    setCiudades([]);
    setComunas([]);
    if (regionId) {
      const data = await geografiaApi.ciudades(regionId);
      setCiudades(data);
    }
  };

  const onCiudadChange = async (ciudadId: number | null) => {
    setComunas([]);
    if (ciudadId) {
      const data = await geografiaApi.comunas(ciudadId);
      setComunas(data);
    }
  };

  return { regiones, ciudades, comunas, loadingRegiones, onRegionChange, onCiudadChange };
}
